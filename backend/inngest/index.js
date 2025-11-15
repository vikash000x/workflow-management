import { Inngest } from "inngest";
import prisma from "../config/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "workflow-management" });

const syncUserCreation = inngest.createFunction(
    {id : 'Sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event}) => {
        const {data} = event;
        console.log("User creation event received:", event);
        await  prisma.user.create({
            data : {
                id : data.id,
                email: data.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image_url: data?.image_url
            }
        })
        console.log("User created in DB");
    }
)

const syncUserDeletion = inngest.createFunction(
    {id : 'delete-user-from-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event}) => {
        const {data} = event;
        await  prisma.user.delete({
            data : {
                id : data.id
                
            }
        })
    }
)

const syncUserUpdation = inngest.createFunction(
    {id : 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event}) => {
        const {data} = event;
        await  prisma.user.create({
          where: { id: data.id },

            data : {
               
                email: data.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image_url: data?.image_url
            }
        })
    }
)

const syncWorkspaceCreation = inngest.createFunction(
    {id : 'Sync-workspace-from-clerk'},
    {event: 'clerk/organization.created'},
    async ({event}) => {

        console.log("Workspace creation event received:");
        const {data} = event;
        console.log("Workspace data:", data);
        await  prisma.workspace.create({    
            data : {
                id : data.id,
                name: data.name,    
                slug: data.slug,
                ownerId: data.created_by,
                image_url: data.image_url,
            }
        })
              console.log("Workspace created in DB");
        await prisma.workspaceMember.create({
            data: {
                userId: data.created_by,    
                workspaceId: data.id,
                role:"ADMIN"
            }
        })
    }
)

const syncWorkspaceUpdation = inngest.createFunction(
    {id : 'update-workspace-from-clerk'},
    {event: 'clerk/organization.updated'},
    async ({event}) => {
        console.log("Workspace updation event received:");
        const {data} = event;
        await  prisma.workspace.update({
          where: { id: data.id },   
            data : {
                name: data.name,    
                slug: data.slug,
                image_url: data.image_url,
            }
        })
    }
)

const syncWorkspaceDeletion = inngest.createFunction(           
    {id : 'delete-workspace-from-clerk'},
    {event: 'clerk/organization.deleted'},
    async ({event}) => {
        const {data} = event;       
        await  prisma.workspace.delete({
            where : {
                id : data.id,   
            }
        })
    }       
)

const syncWorkspaceMemberCreation = inngest.createFunction(
    {id : 'Sync-workspace-member-from-clerk'},
    {event: 'clerk/organization_member.accepted'},
    async ({event}) => {
        const {data} = event;
        await  prisma.workspaceMember.create({  
            data : {
                userId : data.id,
                workspaceId: data.organization_id,
                role: String(data.role_name).toUpperCase()
            }
        })
    }
)


// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, syncWorkspaceCreation, syncWorkspaceUpdation, syncWorkspaceDeletion, syncWorkspaceMemberCreation];