const { RoleOfficeAccess } = require('../constants/permissions');

function allowOffice(requiredOffice) {
  return (req, res, next) => {
    const user = req.user;

    const allowed = user.roles.some(
      role => RoleOfficeAccess[role]?.includes(requiredOffice)
    );

    if (!allowed) {
      return res.status(403).json({
        message: 'ليس لديك صلاحية الوصول إلى هذا القسم',
      });
    }

    next();
  };
}

module.exports = { allowOffice };