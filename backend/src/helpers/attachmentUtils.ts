
import { TodoAccess } from './todosAcess'



// TODO: Implement the fileStogare logic
const toDoAccess = new TodoAccess()

export async function generateUploadUrl(userId: string, todoId: string): Promise<string> {
    const uploadUrl = await toDoAccess.getSignedUrlS3Bucket(todoId)
    await toDoAccess.updateUrl(userId, todoId)

    return uploadUrl
}
