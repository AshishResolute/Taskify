import emailQueue from './emailQueue.js'
import transporter from './mailer.js'


emailQueue.process(async (job)=>{
    const {to,subject,taskTitle,deadline} = job.data;
    await transporter.sendMail({
        from:`ashish@taskifyPro.dev`,
        to,
        subject,
        html:`<p> You have been assigned a new Task <strong>${subject}</strong> with Deadline due at ${deadline}</p>`
    })
    console.log(`Email sent to ${to} `)
})
