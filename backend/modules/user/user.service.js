const repo = require('./user.repository');  
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (data) => {
    // check tai khoan ton tai chua
    const existingUser = await repo.findByUsername(data.username);
    if(existingUser) {
        throw new Error('Username already exists');
    }

    // hass password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // tao nguoi dung moi
    const newUser = await repo.createUser({
        username: data.username,
        password: hashedPassword,
        phone: data.phone,
        full_name: data.full_name,
        role: data.role,
        avatar_url: data.avatar_url || null,
        is_active: true
    });

    return newUser;
}

const login = async (data) => {
    // tim kiem user
    console.log('data:', data);
    const user = await repo.findByUsername(data.username);
    console.log('cde');
    if(!user) {
        throw new Error('Invalid username or password');
    }

    // kiem tra password
    const isMatch = await bcrypt.compare(data.password, user.password);
    if(!isMatch) {
        throw new Error('Invalid username or password');
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }                        
     );

     return {
        token,
        user
     }
}

const getMe = async (userId) => {
    const user = await repo.findById(userId);
    if(!user) {
        throw new Error('User not found');
    }

    return user;
}

module.exports = {
    register,
    login,
    getMe
}