const mongoose = require('mongoose');
const User = require('../models/User');
const Business = require('../models/Business');
const { Subscription } = require('../models/Subscription');
const SupportTicket = require('../models/SupportTicket');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('./subscriptionController');

const escapeCSV = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const buildUserQuery = (query) => {
  const q = { role: { $ne: 'superadmin' } };
  if (query.status === 'blocked') q.isBlocked = true;
  if (query.status === 'active') q.isBlocked = false;
  if (query.search) {
    q.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }
  return q;
};

exports.exportUsers = async (req, res) => {
  try {
    const format = req.query.format || 'csv';
    const { userIds } = req.body || {};
    let users;

    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      const validIds = userIds.filter((id) => mongoose.isValidObjectId(id));
      users = await User.find({ _id: { $in: validIds }, role: { $ne: 'superadmin' } }).lean();
    } else {
      users = await User.find(buildUserQuery(req.query)).lean();
    }

    const businesses = await Business.find({ userId: { $in: users.map((u) => u._id) } }).lean();
    const subs = await Subscription.find({ userId: { $in: users.map((u) => u._id) } }).lean();

    const bizMap = {};
    businesses.forEach((b) => { bizMap[b.userId.toString()] = b; });
    const subMap = {};
    subs.forEach((s) => { subMap[s.userId.toString()] = s; });

    const rows = users.map((u) => ({
      Name: u.name || '',
      Email: u.email || '',
      Role: u.role || 'user',
      'Account Status': u.isBlocked ? 'Blocked' : 'Active',
      'Subscription Plan': subMap[u._id.toString()]?.plan || 'Free',
      'Subscription Status': subMap[u._id.toString()]?.status || 'active',
      'Subscription Expiry': subMap[u._id.toString()]?.expiryDate ? new Date(subMap[u._id.toString()].expiryDate).toLocaleDateString() : 'N/A',
      'Registration Date': new Date(u.createdAt).toLocaleDateString(),
      'Business Name': bizMap[u._id.toString()]?.businessName || 'N/A',
      'Business Slug': bizMap[u._id.toString()]?.slug || 'N/A',
    }));

    const headers = ['Name', 'Email', 'Role', 'Account Status', 'Subscription Plan', 'Subscription Status', 'Subscription Expiry', 'Registration Date', 'Business Name', 'Business Slug'];
    const timestamp = new Date().toISOString().split('T')[0];

    await logActivity(
      req.user._id, req.user.name, 'data_exported', 'export', null,
      `SuperAdmin ${req.user.name} exported ${users.length} user(s) as ${format.toUpperCase()}`
    );

    if (format === 'excel') {
      const xmlHeader = '<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n';
      const tableHeader = `<Table>\n<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>\n`;
      const tableRows = rows.map((row) =>
        `<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${escapeCSV(row[h]).replace(/"/g, '')}</Data></Cell>`).join('')}</Row>`
      ).join('\n');
      const xml = `${xmlHeader}<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n${tableHeader}${tableRows}\n</Table>\n</Workbook>`;

      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', `attachment; filename=users_export_${timestamp}.xls`);
      return res.send(xml);
    }

    const csvLines = [headers.join(',')];
    rows.forEach((row) => {
      csvLines.push(headers.map((h) => escapeCSV(row[h])).join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=users_export_${timestamp}.csv`);
    res.send(csvLines.join('\n'));
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportBusinesses = async (req, res) => {
  try {
    const format = req.query.format || 'csv';
    const businesses = await Business.find().populate('userId', 'name email').lean();

    const headers = ['Business Name', 'Owner Name', 'Owner Email', 'Slug', 'Category', 'Phone', 'Email', 'Website', 'Is Published', 'Is Suspended', 'Created Date'];
    const rows = businesses.map((b) => ({
      'Business Name': b.businessName || '',
      'Owner Name': b.userId?.name || '',
      'Owner Email': b.userId?.email || '',
      'Slug': b.slug || '',
      'Category': b.category || '',
      'Phone': b.phone || '',
      'Email': b.email || '',
      'Website': b.website || '',
      'Is Published': b.isPublished ? 'Yes' : 'No',
      'Is Suspended': b.isSuspended ? 'Yes' : 'No',
      'Created Date': new Date(b.createdAt).toLocaleDateString(),
    }));

    const timestamp = new Date().toISOString().split('T')[0];

    await logActivity(
      req.user._id, req.user.name, 'data_exported', 'export', null,
      `SuperAdmin ${req.user.name} exported ${businesses.length} business(es) as ${format.toUpperCase()}`
    );

    if (format === 'excel') {
      const xmlHeader = '<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n';
      const tableHeader = `<Table>\n<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>\n`;
      const tableRows = rows.map((row) =>
        `<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${escapeCSV(row[h]).replace(/"/g, '')}</Data></Cell>`).join('')}</Row>`
      ).join('\n');
      const xml = `${xmlHeader}<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n${tableHeader}${tableRows}\n</Table>\n</Workbook>`;

      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', `attachment; filename=businesses_export_${timestamp}.xls`);
      return res.send(xml);
    }

    const csvLines = [headers.join(',')];
    rows.forEach((row) => {
      csvLines.push(headers.map((h) => escapeCSV(row[h])).join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=businesses_export_${timestamp}.csv`);
    res.send(csvLines.join('\n'));
  } catch (error) {
    console.error('Export businesses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportSubscriptions = async (req, res) => {
  try {
    const format = req.query.format || 'csv';
    const subs = await Subscription.find().populate('userId', 'name email').lean();

    const headers = ['User Name', 'Email', 'Plan', 'Status', 'Start Date', 'Expiry Date', 'Assigned By'];
    const rows = subs.map((s) => ({
      'User Name': s.userId?.name || '',
      'Email': s.userId?.email || '',
      'Plan': s.plan || '',
      'Status': s.status || '',
      'Start Date': s.startDate ? new Date(s.startDate).toLocaleDateString() : 'N/A',
      'Expiry Date': s.expiryDate ? new Date(s.expiryDate).toLocaleDateString() : 'N/A',
      'Assigned By': s.assignedBy ? 'SuperAdmin' : 'System',
    }));

    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'excel') {
      const xmlHeader = '<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n';
      const tableHeader = `<Table>\n<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>\n`;
      const tableRows = rows.map((row) =>
        `<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${escapeCSV(row[h]).replace(/"/g, '')}</Data></Cell>`).join('')}</Row>`
      ).join('\n');
      const xml = `${xmlHeader}<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n${tableHeader}${tableRows}\n</Table>\n</Workbook>`;

      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', `attachment; filename=subscriptions_export_${timestamp}.xls`);
      return res.send(xml);
    }

    const csvLines = [headers.join(',')];
    rows.forEach((row) => {
      csvLines.push(headers.map((h) => escapeCSV(row[h])).join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=subscriptions_export_${timestamp}.csv`);
    res.send(csvLines.join('\n'));
  } catch (error) {
    console.error('Export subscriptions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
