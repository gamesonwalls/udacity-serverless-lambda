import { TodoAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic

///create an instance of todo list
const toDoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {

    return await toDoAccess.getAllTodos(userId)
}

//Update Item
export async function updateToDoItem(req: UpdateTodoRequest, userId: string, todoId: string): Promise<void> {
    await toDoAccess.updateToDoItem(req, userId, todoId)
}

//Create Item
export async function createToDoItem(req: CreateTodoRequest, userId: string): Promise<TodoItem> {
    return await toDoAccess.createToDoItem({
        userId,
        todoId: uuid.v4(),
        done: false,
        createdAt: new Date().toISOString(),
        ...req
    })
}



export async function deleteItem(userId: string, todoId: string): Promise<void> {
    await Promise.all([
        toDoAccess.deleteItem(userId, todoId),
        toDoAccess.deleteTodoAttachment(todoId)
    ])
}



