import prisma from "../config/prisma.js";
import { inngest } from "../inngest/index.js";

export const createTask = async(req, res) => {
    try{
       
        const {userId} =  await req.auth();
        const {projectId, title, description, status, priority, type, assigneeId, due_date} = req.body;
        const origin = req.get('origin')

        
        const project = await prisma.project.findUnique({
            where : {id: projectId},
            include : {members : {include: {user: true}}}
        })

 
        if(!project){
           
            return res.status(404).json({message: "Project not found"})
        }
        
        
        else if(project.team_lead !== userId){
           
            return res.status(403).json({message: "You do not have permission to create tasks in this project"} )
        }else if(assigneeId && !project.members.some((member)=> member.userId === assigneeId)){
            return res.status(400).json({message: "Assignee must be a member of the project"})
        }

       
        const task = await prisma.task.create({
            data : {
                projectId,  
                title,
                description,
                status,
                priority,
                type,
                assigneeId,
                due_date : due_date ? new Date(due_date) : null,

            } })

            console.log("hhh4")
            const taskWithAssignee = await prisma.task.findUnique({
                where: { id: task.id },
                include: { assignee: true }
            });
console.log("hhh5")
            await inngest.send({
                name: "app/task.assigned",
                data: {
                    taskId : task.id, origin
                }
            })

            console.log("hhh6")
            res.json({task : taskWithAssignee, message: "Task created successfully"})

     

    }catch(error){
        res.status(500).json({message: error.code || error.message})
    }
}

export const updateTask = async(req, res) => {
    try{
       
       // const {id, projectId, title, description, status, priority, type, assigneeId, due_date} = req.body;
        const task = await prisma.task.findUnique({
            where : {id: req.params.id}
        })

        if(!task){
            return res.status(404).json({message: "Task not found"})
        }

         const {userId} = await req.auth();

         const project = await prisma.project.findUnique({
            where : {id: task.projectId},
            include: {members:  {include: {user: true}}}
        })

        if(!project){
            return res.status(404).json({message: "project not found"})
        }
        else if(project.team_lead !== userId){
            return res.status(403).json({message: "You do not have permission to update tasks in this project"} )
        }
      const updatedTask = await prisma.task.update({
            where : {id: req.params.id},
            data : req.body
        })
        res.json({task: updatedTask, message: "Task updated successfully"})

    } catch(error){
        console.log(error);
        res.status(500).json({message: error.code || error.message})
    }       
}

export const deleteTask = async(req, res) => {
    try{

      
        const {userId} = await req.auth();
        const {taskIds} = req.body;
  
          const tasks = await prisma.task.findMany({
            where : {id: {in: taskIds}}
        })

     if(tasks.length === 0){
        return res.status(404).json({message: "task not found"});
     }

     const project  = await prisma.project.findUnique({
        where : { id : tasks[0].projectId},
        include : {members : {include: {user: true}}}
     })

     if(!project){
        return res.status(404).json({message: "project not found"})
     }else if(project.team_lead !== userId){
        return res.status(403).json({message: "You do not have permission to delete tasks in this project"} )
     }

     await prisma.task.deleteMany({
        where : {id: {in: taskIds}}
     })
        res.json({message: "Tasks deleted successfully"})


    } catch(error){         
        console.log(error);
        res.status(500).json({message: error.code || error.message})
    }
}