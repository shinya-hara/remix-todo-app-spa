import { LowSync, MemorySync } from "lowdb";
import { v4 as uuid } from "uuid";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

type DB = {
  tasks: Task[];
};

const adapter = new MemorySync<DB>();

const defaultData: DB = {
  tasks: [
    { id: uuid(), title: "task 1", completed: false },
    { id: uuid(), title: "task 2", completed: false },
    { id: uuid(), title: "task 3", completed: true },
  ],
};

const db = new LowSync<DB>(adapter, defaultData);

export const getTasks = async () => {
  await realDelay();
  return db.data.tasks;
};

export const createTask = async (params: Pick<Task, "title">) => {
  await realDelay();
  const task = { id: uuid(), title: params.title, completed: false };
  db.data.tasks.push(task);
  db.write();
  return task;
};

export const updateTask = async (
  id: string,
  params: Partial<Omit<Task, "id">>
) => {
  await realDelay();
  const task = db.data.tasks.find((task) => task.id === id);
  if (task) {
    Object.assign(task, params);
    db.write();
  }
  return task;
};

export const deleteTask = async (id: string) => {
  await realDelay();
  const index = db.data.tasks.findIndex((task) => task.id === id);
  if (index !== -1) {
    db.data.tasks.splice(index, 1);
    db.write();
  }
};

export const deleteCompletedTasks = async () => {
  await realDelay();
  const tasks = db.data.tasks.filter((task) => !task.completed);
  db.data.tasks = tasks;
  db.write();
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function realDelay() {
  const MIN_SERVER_RESPONSE_TIME = 100;
  const MAX_SERVER_RESPONSE_TIME = 400;
  const realisticResponseTime = Math.floor(
    Math.random() * (MAX_SERVER_RESPONSE_TIME - MIN_SERVER_RESPONSE_TIME) +
      MIN_SERVER_RESPONSE_TIME
  );
  await sleep(realisticResponseTime);
}
