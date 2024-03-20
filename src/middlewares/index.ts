import { NextFunction, Request, Response } from 'express';
import moment from 'moment';

// Imports
import restrictAccess from './restrict-access.middleware'
import authenticateJWT from './auth.middleware'

const middlewareRoot = (req: Request, res: Response, next: NextFunction) => {
  console.log('\n--------------------------\n');
  console.log(
    moment().format('MMMM DD YYYY, hh:mm A'),
    '\nMethod -> ',
    req.method,
    ' => ',
    'https://' + req.headers.host + req.url
  );
  console.log('\nbody -> ', req.body);
  console.log('query -> ', req.query);
  console.log('params -> ', req.params);
  console.log('\n--------------------------\n');
  next();
};

export default middlewareRoot;
export {restrictAccess,authenticateJWT}