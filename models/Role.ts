import mongoose, { Document } from 'mongoose'

export interface IRole extends Document {
    name : string,
    description? : string,
    permissions : mongoose.Types.ObjectId[],
    isSystemRole : boolean,
    createdAt : Date
}

const roleSchema = new mongoose.Schema<IRole>({
    name : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        uppercase : true
    },
    description : {
        type : String,
        trim : true
    },
    permissions : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Permission',
    }],
    isSystemRole : {
        type : Boolean,
        required : true
    }
}, {
    timestamps : true
})

roleSchema.index({name : 1})

export const Role : mongoose.Model<IRole> = mongoose.models.Role || mongoose.model<IRole>('Role', roleSchema) 