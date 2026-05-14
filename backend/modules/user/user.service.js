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
    const user = await repo.findByUsername(data.username);
    
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

const updateLocation = async (userId, lat, lng) => {
    return await repo.updateLocation(userId, lat, lng);
}

const updateProfile = async (userId, data) => {
    const allowedData = {
        full_name: typeof data.full_name === 'string' ? data.full_name : undefined,
        phone: typeof data.phone === 'string' ? data.phone : undefined,
        avatar_url: typeof data.avatar_url === 'string' ? data.avatar_url : undefined
    };

    return repo.updateProfile(userId, allowedData);
}

const listUsers = async (filters) => {
    return repo.listUsers(filters);
}

const setActive = async (userId, isActive) => {
    return repo.setActive(userId, isActive);
}

module.exports = {
    register,
    login,
    getMe,
    updateLocation,
    updateProfile,
    listUsers,
    setActive
}
