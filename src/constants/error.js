'use strict';
module.exports = {
  OK: {
    code: 0,
    type: 'Success',
    message: 'Hoàn thành hoạt động',
    http: 200,
  },
  SYSTEM: {
    GENERIC: {
      code: 1,
      type: 'Unknown',
      message: 'Lỗi không xác định',
      http: 500,
    },
    INTERNAL: {
      code: 2,
      type: 'Internal_Server',
      message: 'Lỗi máy chủ nội bộ',
      http: 500,
    },
  },
  VALIDATION: {
    GENERIC: {
      code: 100,
      type: 'Validation',
      message: '',
      http: 500,
    },
    SWAGGER_VALIDATION: {
      code: 101,
      type: 'Swagger_Validation',
      message: '',
      http: 400,
    },
    INVALID_REQUEST: {
      code: 102,
      type: 'Validation',
      message: 'Yêu cầu không hợp lệ',
      http: 400,
    },
    NOT_FOUND: {
      code: 103,
      type: 'Validation',
      message: 'Không tìm thấy',
      http: 400,
    },
    UID_T26: {
      code: 103,
      type: 'Validation',
      message: 'UID requires 26 charaters',
      http: 400,
    },
  },
  AUTH: {
    GENERIC: {
      code: 200,
      type: 'Authorization',
      message: 'Không được thiết lập',
      http: 403,
    },
    INVALID_CLIENT: {
      code: 201,
      type: 'Authorization',
      message: 'Ứng dụng khách Oauth2 không hợp lệ',
      http: 401,
    },
    INVALID_TOKEN: {
      code: 202,
      type: 'Authorization',
      message: 'Mã không hợp lệ',
      http: 401,
    },
    UNAUTHENTICATION: {
      code: 203,
      type: 'Authorization',
      message: 'Phiên không hợp lệ',
      http: 401,
    },
    UNAUTHORIZED: {
      code: 203,
      type: 'Authorization',
      message: 'Bạn không có quyền',
      http: 403,
    },
  },
  DATABASE: {
    GENERIC: {
      code: 300,
      type: 'Database',
      message: 'Không được thiết lập',
      http: 500,
    },
    DUPLICATE: {
      code: 301,
      type: 'Database',
      message: 'Tài nguyên tồn tại',
      http: 404,
    },
    NOT_EXIST: {
      code: 302,
      type: 'Database',
      message: 'Tài nguyên không tồn tại',
      http: 404,
    },
  },
};
