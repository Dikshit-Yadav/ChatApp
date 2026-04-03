import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    isGroup:{
        type:Boolean,
        default:false
    },
    members:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
    ],
    groupName:{
        type:String,
        default:""
    },
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
},
    {timestamps:true},
);

export default mongoose.model("Conversation", conversationSchema);