import type { MetaFunction } from "@remix-run/node";
import {
  ClientActionFunctionArgs,
  Form,
  json,
  useLoaderData,
} from "@remix-run/react";
import clsx from "clsx";
import { Task } from "~/components/Task";
import {
  createTask,
  deleteCompletedTasks,
  deleteTask,
  getTasks,
  updateTask,
} from "~/data";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const clientLoader = async () => {
  const tasks = await getTasks();
  return json({ tasks });
};

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const formData = await request.formData();

  const action = formData.get("_action") as string;

  if (action === "add") {
    const title = formData.get("title") as string;
    if (!title) return null;

    const task = await createTask({ title });
    const titleField = document.querySelector("#title");
    if (titleField instanceof HTMLInputElement) {
      titleField.value = "";
    }
    return json({ task });
  }

  if (action === "update") {
    const task = await updateTask(formData.get("id") as string, {
      title: formData.get("title") as string,
    });
    return json({ task });
  }

  if (action === "toggle") {
    const task = await updateTask(formData.get("id") as string, {
      completed: formData.get("completed") === "true",
    });
    return json({ task });
  }

  if (action === "delete") {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (confirmed) {
      await deleteTask(formData.get("id") as string);
    }
    return null;
  }

  if (action === "deleteCompleted") {
    const confirmed = window.confirm(
      "Are you sure you want to delete all completed tasks?"
    );
    if (confirmed) {
      await deleteCompletedTasks();
    }
    return null;
  }
};

export default function Index() {
  const { tasks } = useLoaderData<typeof clientLoader>();
  const hasCompletedTasks = tasks.some((task) => task.completed);

  return (
    <div className="bg-primary text-white min-h-svh p-4">
      <h1 className="text-xl font-bold mb-4">Remix todo app</h1>
      <Form method="post" className="mb-4 flex">
        <input
          id="title"
          type="text"
          name="title"
          placeholder="New task"
          className="w-full p-4 rounded-l-lg rounded-r-none text-gray-600"
        />
        <button
          className="p-4 shrink-0 border-y-2 border-r-2 border-white rounded-r-lg hover:bg-white/10"
          name="_action"
          value="add"
        >
          Add
        </button>
      </Form>

      <Form method="delete" className="flex justify-end">
        <button
          className={clsx("underline mb-4", {
            "opacity-50": !hasCompletedTasks,
            "cursor-not-allowed": !hasCompletedTasks,
          })}
          name="_action"
          value="deleteCompleted"
          disabled={!hasCompletedTasks}
        >
          Delete completed tasks
        </button>
      </Form>

      {tasks.length ? (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <Task
              key={task.id}
              id={task.id}
              title={task.title}
              completed={task.completed}
            />
          ))}
        </div>
      ) : (
        <p className="text-2xl text-center">
          All clear! 😊 Enjoy your free time. 🐐💨
        </p>
      )}
    </div>
  );
}
