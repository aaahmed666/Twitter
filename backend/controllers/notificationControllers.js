import Notification from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notification = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    await notification.updateMany({ to: userId, read: true });

    res.status(201).json(notification);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId);
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    if (notification.to.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You do not have permission to delete this notification",
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
