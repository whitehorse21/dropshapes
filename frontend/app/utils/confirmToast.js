// utils/confirmToast.js
import toast from "react-hot-toast";
import React from "react";

export const confirmToast = (message = "Are you sure?") =>
  new Promise((resolve) => {
    const id = toast.custom((t) => (
      <div
        className={`bg-white shadow-lg rounded-lg p-4 w-full max-w-sm border ${t.visible ? "animate-enter" : "animate-leave"
          }`}
      >
        <p className="text-sm text-gray-800 mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
            onClick={() => {
              toast.dismiss(id);
              resolve(true);
            }}
          >
            Confirm
          </button>
          <button
            className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => {
              toast.dismiss(id);
              resolve(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  });
