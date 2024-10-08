import { ApiResponseInterface } from '../interface';

const apiResponse = (params: ApiResponseInterface) => {
  const { res, message = 'OK', code = 200, err, errors, success = true, data } = params;

  console.log({
    success: success,
    status: success,
    statusCode: code,
    message: code === 500 ? 'Request Failed' : message,
    errors,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : null,
    data,
  });
  console.log('\n--------------------------\n');

  return res.status(code).json({
    success: success,
    status: success,
    statusCode: code,
    message: code === 500 ? 'Request Failed' : message,
    errors,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : null,
    data,
  });
};

export { apiResponse };
