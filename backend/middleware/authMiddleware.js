export const protect = (req, res, next) => {
  try {
    console.log("AUTH DEBUG:");

    const { userId } = req.auth();
   

    console.log("Authenticated userId:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

   return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
