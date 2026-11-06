// Clave secreta para firmar los tokens JWT.
// En un sistema real se guarda en una variable de entorno (.env), nunca en el código.
export const JWT_SECRETO = process.env.JWT_SECRETO ?? 'tatacoa-secreto-de-desarrollo';
