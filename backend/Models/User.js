const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    
    name: {
        type: String,
        requried: true,
        trim: true
    },

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    googleId: {
        type: String,
        unique: true,
        sparse: true
    },

    bio: {
        type: String,
        default: '',
        maxlength: 160
    },

    avatar: {
        type: String,
        default: ''
    },

    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

},

{ timestamps: true }

);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    // manually enforce the password length manually before hashing it
    if (!this.password || this.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    // hash it safely now
    this.password = await bcrypt.hash(this.password, 10);
    
});

userSchema.methods.matchPassword = async function (typedPassword) {
    if (!this.password) {
        return false;
    }

    return await bcrypt.compare(typedPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);