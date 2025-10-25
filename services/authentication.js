import jwt from "jsonwebtoken";


export function createTokenForUser(user) {
    const secret = process.env.JWT_SECRET;
    console.log("The secret key is",secret)
    const payload = {
        _id: user._id,
        email: user.email
    }

    const token = jwt.sign(payload,secret);
    return token;
}


export function validateToken(token) {
    const secret = process.env.JWT_SECRET;
    if(!token) {
        throw new Error('Invalid user');
    }

    const payload = jwt.verify(token,secret);
    return payload;
}