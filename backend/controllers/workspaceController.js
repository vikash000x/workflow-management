import prisma from "../config/prisma.js";


export const getUserWorkspaces = async (req, res) => {
    
    try {
        const {userId} = req.auth();
       const workspaces = await prisma.workspace.findMany({
        where : {
            members: {some: {userId : userId }}
        },
        include: {
            members: {include: {user: true}},
            projects: {
                include: {
                    tasks: {include: {assignee: true,comments: {include:  {user: true}} }},
                    members: {include: {user: true}}
                   
                }
            },
            owner: true
        }
       })
   res.json({workspaces});

    } catch (error) {
        console.error("Error fetching user workplaces:", error);
        res.status(500).json({ error: "Internal server error" });
    }

}

export const addMember = async (req, res) => {
    try {
         const {userId} = req.auth();
         const {email, role, workspaceId, message} = req.body;
        const user = await prisma.user.findUnique({
            where: {email: email}
        });

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        if(!workspaceId || !role){
            return res.status(400).json({message: "Workspace ID and role are required"});
        }

        if(!["ADMIN", "MEMBER"].includes(role)){
            return res.status(400).json({message: "Invalid role"});
        }
        const workspace = await prisma.workspaceMember.findFirst({where: {id: workspaceId},
include: {members: true}
        });

        if(!workspace){
            return res.status(404).json({message: "Workspace not found"});
        }

        if(!workspace.members.find(member => member.userId === userId && member.role === "ADMIN")){
            return res.status(403).json({message: "Only admins can add members"});
        }

        const existingMember = workspace.members.find(member => member.userId === user.id);
        if(existingMember){
            return res.status(400).json({message: "User is already a member of the workspace"});
        }

        const member = await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId,
                role,
                message
            }
        })

res.json({member, message: "member added successfully" });


    } catch (error) {
        res.status(500).json({ message: error.code || error.message });
    }

}