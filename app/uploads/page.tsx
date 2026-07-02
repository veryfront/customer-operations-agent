"use client";

import { UploadsPanel, useUploadsRegistry } from "veryfront/chat";

export default function UploadsPage(): React.JSX.Element {
  // A durable, cross-conversation list of everything uploaded (localStorage +
  // the /api/uploads endpoint). Remove deletes from storage via DELETE.
  const uploads = useUploadsRegistry({ api: "/api/uploads", storageKey: "cx-uploads" });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
      <UploadsPanel
        uploads={uploads.items}
        onAttach={(files) => uploads.upload(files)}
        onRemoveUpload={(id) => void uploads.remove(id)}
      />
    </div>
  );
}
