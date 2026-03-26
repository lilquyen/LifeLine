const uploadToCloudinary = require('../utils/upLoadToCloudinary');

const uploadImages = async (files) => {
    if (!files || files.length === 0) return [];

    const uploadPromise = files.map(file => 
        uploadToCloudinary(file.buffer)
    );

    const results = await Promise.all(uploadPromise); 

    return results.map(r => r.secure_url);
};

module.exports = {
    uploadImages
};