import { Inngest } from "inngest";
import prisma from "../config/prisma.js";
import { sendEventResponseSchema } from "inngest/types";
import sendMail from "../config/nodemailer.js";

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
                image: data?.image_url
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
    { id: "Sync-workspace-from-clerk" },
    { event: "clerk/organization.created" },
    async ({ event }) => {
        const { data } = event;

        // SAFETY: Ensure owner exists
        await prisma.user.upsert({
            where: { id: data.created_by },
            update: {},
            create: {
                id: data.created_by,
                email: "",
                name: "",
                image: ""
            }
        });

        await prisma.workspace.create({
            data: {
                id: data.id,
                name: data.name,
                slug: data.slug,
                ownerId: data.created_by,
                image_url: data.image_url
            }
        });

        await prisma.workspaceMember.create({
            data: {
                userId: data.created_by,
                workspaceId: data.id,
                role: "ADMIN"
            }
        });

        console.log("Workspace created in DB");
    }
);

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
    {event: 'clerk/organizationMembership.created'},
    async ({event}) => {
        const {data} = event;
        await  prisma.workspaceMember.create({  
            data : {
                userId : data.id,
                workspaceId: data.organization.id,
                role: String(data.role_name).toUpperCase()
            }
        })
    }
)


 const sendTaskAssignmentEmail = inngest.createFunction(
    { id: "send-task-assignment-email" },
    { event: "app/task.assigned" },
   async({event, step}) => {
    const {taskId, origin} = event.data;

    const task  = await prisma.task.findUnique({
        where : {id: taskId},
        include : {assignee : true, project : true}
    });
     await sendMail({
to : task.assignee.email,
subject: `New Task Assignment in ${task.project.name}`,
body: `
  <div style="font-family: Inter, Arial, sans-serif; background:#f5f7fa; padding:40px 0;">
    <div style="
        max-width:600px;
        margin:0 auto;
        background:#ffffff;
        border-radius:12px;
        padding:40px;
        box-shadow:0 4px 20px rgba(0,0,0,0.08);
    ">
      
      <h2 style="color:#1a1a1a; margin-top:0; font-size:24px;">
        Hello ${task.assignee.name || 'there'} 👋
      </h2>

      <p style="color:#555; font-size:15px; margin-bottom:18px;">
        You’ve been assigned a new task in the project 
        <strong style="color:#000">${task.project.name}</strong>.
      </p>

      <!-- CARD -->
      <div style="
          background:#f9fafb;
          border:1px solid #e5e7eb;
          border-radius:10px;
          padding:20px;
          margin:25px 0;
      ">
        <h3 style="margin-top:0; color:#111827; font-size:18px;">📝 Task Details</h3>

        <p style="margin:6px 0; color:#374151;">
          <strong>Title:</strong> ${task.title}
        </p>
        <p style="margin:6px 0; color:#374151;">
          <strong>Description:</strong> ${task.description || 'No description provided.'}
        </p>
        <p style="margin:6px 0; color:#374151;">
          <strong>Status:</strong> ${task.status}
        </p>
        <p style="margin:6px 0; color:#374151;">
          <strong>Priority:</strong> ${task.priority}
        </p>
        <p style="margin:6px 0; color:#374151;">
          <strong>Type:</strong> ${task.type}
        </p>
      </div>

      <!-- CTA BUTTON -->
      <div style="text-align:center; margin:30px 0;">
        <a href="${origin}"
          style="
            background:#4f46e5;
            color:#fff;
            text-decoration:none;
            padding:14px 26px;
            border-radius:8px;
            font-size:16px;
            display:inline-block;
          "
        >
          View Task →
        </a>
      </div>

      <p style="color:#6b7280; font-size:14px; line-height:1.6;">
        If you have any questions or need help, feel free to reach out anytime.
      </p>

      <p style="color:#111; font-size:15px; margin-top:25px;">
        Best regards,<br />
        <strong>Workflow Management Team</strong>
      </p>
    </div>
  </div>
`

     })


     if(new Date(task.due_date).toLocaleDateString() !== new Date().toDateString()){
        await step.sleepUntil('wait-for-the-due-date', new Date(task.due_date));

        await step.run('check-if-task-is-completed', async()=> {
            const task = await prisma.task.findUnique({
                where : {id: taskId},
                include : {assignee : true, project : true} 
            })

            if(!task) return;

            if(task.status !== "DONE"){
                await step.run('send-task-reminder-emai', async()=> {
                    await sendMail({
                        to : task.assignee.email,
                        subject: `Reminder for ${task.project.name}`,
                       body: `
  <div style="font-family: Inter, Arial, sans-serif; background:#f5f7fa; padding:40px 0;">
    <div style="
        max-width:600px;
        margin:0 auto;
        background:#ffffff;
        border-radius:12px;
        padding:40px;
        box-shadow:0 4px 20px rgba(0,0,0,0.08);
    ">

      <h2 style="color:#1a1a1a; margin-top:0; font-size:24px;">
        Hello ${task.assignee.name || 'there'} 👋
      </h2>

      <p style="color:#555; font-size:15px; margin-bottom:18px;">
        This is a friendly reminder that your task 
        <strong style="color:#000">${task.title}</strong> 
        from the project 
        <strong style="color:#000">${task.project.name}</strong> 
        is due today.
      </p>

      <!-- CARD -->
      <div style="
          background:#f9fafb;
          border:1px solid #e5e7eb;
          border-radius:10px;
          padding:20px;
          margin:25px 0;
      ">
        <h3 style="margin-top:0; color:#111827; font-size:18px;">⏰ Task Overview</h3>

        <p style="margin:6px 0; color:#374151;">
          <strong>Title:</strong> ${task.title}
        </p>
        <p style="margin:6px 0; color:#374151;">
          <strong>Status:</strong> ${task.status}
        </p>
        <p style="margin:6px 0; color:#374151;">
          <strong>Priority:</strong> ${task.priority}
        </p>
        <p style="margin:6px 0; color:#374151;">
          <strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align:center; margin:30px 0;">
        <a href="${origin}"
          style="
            background:#4f46e5;
            color:#fff;
            text-decoration:none;
            padding:14px 26px;
            border-radius:8px;
            font-size:16px;
            display:inline-block;
          "
        >
          View Task →
        </a>
      </div>

      <p style="color:#6b7280; font-size:14px; line-height:1.6;">
        Please make sure to complete it on time.  
        We're here if you need anything!
      </p>

      <p style="color:#111; font-size:15px; margin-top:25px;">
        Best regards,<br />
        <strong>Workflow Management Team</strong>
      </p>
    </div>
  </div>
`

                    })
                })
            }
        } )
     }

   }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, syncWorkspaceCreation, syncWorkspaceUpdation, syncWorkspaceDeletion, syncWorkspaceMemberCreation, sendTaskAssignmentEmail];