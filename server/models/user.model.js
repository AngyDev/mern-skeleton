import mongoose from 'mongoose';

/**
 * The user schema definition object needed to generate the new Mongoose schema 
 * will declare all the user data fields and associated properties.
 */
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name is required'
    },
    email: {
        type: String,
        trim: true,
        unique: 'Email already exists',
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        required: 'Email is required'
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    // represent the encrypted user password that we will use for authentication.
    hashed_password: {
        type: String,
        required: "Password is required"
    },
    salt: String
});

/**
 * The user password is not stored directly in the user document, it is handled as a virtual field
 * When the password value is received on user creation or update, it is encrypted into a new hashed 
 * value and set to the hashed_password field, along with the salt value in the salt field.
*/
UserSchema
    .virtual('password')
    .set(function (password) {
        this._password = password
        this.salt = this.makeSalt()
        this.hashed_password = this.encryptPassword(password)
    })
    .get(function () {
        return this._password
    });

/**
 * Adds validation logic to the password field
 */
UserSchema.path('hashed_password').validate(function (v) {
    if (this._password && this._password.length < 6) {
        this.invalidate('password', 'Password must be at least 6 characters.')
    }
    if (this.isNew && !this._password) {
        this.invalidate('password', 'Password is required')
    }
}, null);

/**
 * The encryption logic and salt generation logic, which are used to generate the hashed_password 
 * and salt values representing the password value, are defined as UserSchema methods.
 */
UserSchema.methods = {
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password
    },
    encryptPassword: function (password) {
        if (!password) return ''
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')
        } catch (err) {
            return ''
        }
    },
    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + ''
    }
}

export default mongoose.model('User', UserSchema);