const { User } = require("../../models/users.model");
const { Admin } = require("../../models/admins.model");


exports.editUser = async (req, res) => {
   const { id } = req.params;
   try {
      const user = await User.findById(id);
      if (!user) {
         return res.status(404).json({
            message: "User not found",
         });
      }

      // Update user properties from req.body
      Object.keys(req.body).forEach((key) => {
         user[key] = req.body[key];
      });

      // Save the updated user
      const updatedUser = await user.save();

      return res.status(200).json({
         message: "User updated successfully",
         user: updatedUser,
      });
   } catch (err) {
      return res.status(500).json({ message: err.message });
   }
}

exports.deleteUser = async (req, res) => {
   const { id } = req.params;
   const user = await User.findById(id);
   if (!user) {
      return res.status(404).json({
         message: "User not found",
      });
   }
   if(user.status === "active"){
      return res.status(400).json({
         message: "User is still active, please deactivate user first",
      });
   }
   await user.deleteOne();

   return res.status(200).json({
      message: "User deleted successfully",
   });
}

exports.deleteAdmin = async (req, res) => {
   const { id } = req.params;
   const password = req.body.password;
   const admin = await Admin.findById(id);
   if (!admin) {
      return res.status(404).json({
         message: "Admin not found",
      });
   }

   if(password !== process.env.SUPER_ADMIN_PASSWORD){
      return res.status(400).json({
         message: "You are not authenticated to perform this action"
      });
   }   

   await admin.deleteOne();

   return res.status(200).json({
      message: "Admin deleted successfully",
   });
}

exports.getAdmins = async (req, res) => {
   const admins = await Admin.find();
   return res.status(200).json({
      admins
   });
};

exports.getSingleAdmin = async (req, res) => {
   const { id } = req.params;
   const admin = await Admin.findById(id);
   if (!admin) {
      return res.status(404).json({
         message: "Admin not found",
      });
   }
   return res.status(200).json({
      admin
   });
};

// TODO: add other admin functions here, don't forget to export them