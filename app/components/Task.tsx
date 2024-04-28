import { Form, useFetcher } from "@remix-run/react";
import { clsx } from "clsx";
import { FC, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  FaCheck,
  FaCircleCheck,
  FaPenToSquare,
  FaRegCircle,
  FaTrash,
} from "react-icons/fa6";

type Props = {
  id: string;
  title: string;
  completed: boolean;
};

const Completed: FC<{ id: string; completed: boolean }> = (props) => {
  const fetcher = useFetcher({ key: "toggleCompleted" });
  // TODO: API通信中に他のタスクの完了状態が変わった場合（=連続操作時）、楽観的UI更新がおかしくなる
  const completed = fetcher.formData
    ? fetcher.formData.get("id") === props.id
      ? fetcher.formData.get("completed") === "true"
      : props.completed
    : props.completed;

  return (
    <fetcher.Form method="post" className="grid place-items-center">
      <button
        name="completed"
        value={completed ? "false" : "true"}
        className="p-1"
      >
        {completed ? (
          <FaCircleCheck size={24} className="text-primary" />
        ) : (
          <FaRegCircle size={24} />
        )}
      </button>
      <input type="hidden" name="_action" value="toggle" />
      <input type="hidden" name="id" value={props.id} />
    </fetcher.Form>
  );
};

const Delete: FC<{ id: string }> = ({ id }) => {
  return (
    <Form method="delete">
      <button
        className="text-gray-500 hover:text-red-700 p-1"
        name="id"
        value={id}
      >
        <FaTrash />
      </button>
      <input type="hidden" name="_action" value="delete" />
    </Form>
  );
};

export const Task: FC<Props> = (props) => {
  const fetcher = useFetcher({ key: "toggleCompleted" });
  // TODO: API通信中に他のタスクの完了状態が変わった場合（=連続操作時）、楽観的UI更新がおかしくなる
  const completed = fetcher.formData
    ? fetcher.formData.get("id") === props.id
      ? fetcher.formData.get("completed") === "true"
      : props.completed
    : props.completed;
  const [isEditMode, setIsEditMode] = useState(false);
  const updateFetcher = useFetcher({ key: "updateTask" });
  const inputRef = useRef<HTMLInputElement>(null);

  // NOTE: タスクの更新が完了したら編集モードを解除する（より良い実装方法がありそう）
  useEffect(() => {
    if (updateFetcher.state === "idle") {
      setIsEditMode(false);
    }
  }, [updateFetcher.state]);

  const startEdit = () => {
    flushSync(() => {
      setIsEditMode(true);
    });
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 text-gray-600">
      <div className="flex gap-1 items-center">
        <Completed id={props.id} completed={completed} />
        <updateFetcher.Form
          method="patch"
          className="flex items-center gap-1 flex-1"
        >
          {isEditMode ? (
            <>
              <input
                ref={inputRef}
                type="text"
                className="text-lg flex-1"
                defaultValue={props.title}
                name="title"
                id={`title-${props.id}`}
              />
              <input
                type="hidden"
                name="id"
                value={props.id}
                className="flex-1"
              />
              <button
                className="text-gray-500 hover:text-primary p-1"
                name="_action"
                value="update"
              >
                <FaCheck />
              </button>
            </>
          ) : (
            <>
              <p
                className={clsx("text-lg flex-1", {
                  "line-through": completed,
                  "text-gray-400": completed,
                })}
              >
                {props.title}
              </p>
              <button
                className="text-gray-500 hover:text-primary p-1"
                onClick={startEdit}
              >
                <FaPenToSquare />
              </button>
            </>
          )}
        </updateFetcher.Form>
        <Delete id={props.id} />
      </div>
    </div>
  );
};
