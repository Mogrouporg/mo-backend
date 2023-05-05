const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName:{
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phoneNumber:{
            type: String,
            required: true,
            unique: true
        },
        balance: {
            type: Number,
            default: 0
        },
        totalInvestment:{
            type: Number,
            default:  0
        },
        totalRoi:{
            type: Number,
            default: 0
        },
        totalLoan: {
            type: Number,
            default: 0
        },
        password: {
            type: String,
            required: false
        },
        refreshTokenHash:{
            type: String,
            required: false
        },
        resetPasswordToken:{
            type: String
        },
        resetPasswordExp:{
            type: Date,
            required: false
        },
        profile_url:{
            type: Array,
            required: false
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        role:{
           type: String,
           enum: ['USER', 'AGENT']
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        lastTransact:{
            type: Date
        },
        currency: {
            type: String,
            enum: ['NGN', 'USD']
        },
        transactions: [{
            amount:{
                type: String,
            },
            user:{
                type: String,
                required: true
            },
            status: {
                type: String,
                enum: ["success", "failed"]
            },
            balance: {
                type: String
            },
            reference: {
                type: String
            },
            type:{
                type: String,
                enum: ['deposit', 'loan', 'withdrawal', 'invest']
            },
            currency: {
                type: String,
                enum: ['USD', 'NGN']
            },
            createdAt:{
                type: Date,
                default: new Date(Date.now())
            }

        }],
        notifications:[{
            message: {
                type: String,
                required: true
            },
            email: {
                type: String,
                ref: 'User',
                required: true
            },
            read: {
                type: Boolean,
                default: false
            },
            createdAt:{
                type: Date,
                default: new Date(Date.now())
            }
        }
        ],
        loanRequests:[{
            user:{
                type: String,
                required: true
            },
            loanAmount:{
                type: String,
            },
            loanPeriod: {
                type: Number,
                max: 3,
            },
            bankName:{
                type: String
            },
            loanDesc:{
                type: String
            },
            createdAt:{
                type: Date,
                default: new Date(Date.now())
            }
        }
        ],
        realEstateInvestment: [
            {
                user: {
                    type: String,
                    required: true
                },
                propertyId: {
                    type: Schema.Types.ObjectId,
                    ref: 'RealEstate',
                    required: true
                },
                roi: {
                    type: Number,
                },
                invPeriod: {
                    type: String
                },
                status:{
                    type: String,
                    enum: ['ongoing','paid']
                },
                createdAt:{
                    type: Date,
                    default: new Date(Date.now())
                },
                currency: {
                    type: String,
                    enum: ['USD', 'NGN']
                },
                currentRoi:{
                    type: Number,
                    default: 0
                }
            }
        ],
        transportInvestment: [
            {
                transportId: {
                    type: Schema.Types.ObjectId,
                    name: "transports",
                    required: true
                },
                userId: {
                    type: Schema.Types.ObjectId,
                    name: "Users",
                    required: true
                },
                status:{
                    type: String,
                    enum: ['ongoing','paid']
                },
                currency: {
                    type: String,
                    enum: ['USD', 'NGN']
                },
                createdAt:{
                    type: Date,
                    default: new Date(Date.now())
                }
            }
        ]
    },{
        timestamps: true
    }
);

UserSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.pre("save", async function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        next();
    } catch (err) {
        return next(err);
    }
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("User", UserSchema);

module.exports = {
    User,
};
