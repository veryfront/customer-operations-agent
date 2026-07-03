'use client'

import { AttachmentsPanel, useUploadsRegistry } from 'veryfront/chat'

export default function UploadsPage(): React.JSX.Element {
  const uploads = useUploadsRegistry({ url: '/api/uploads' })
  return (
    <AttachmentsPanel
      uploads={uploads.items}
      loading={uploads.isLoading}
      onAttach={uploads.upload}
      onRemoveUpload={uploads.remove}
      className="flex-1 min-h-0"
    />
  )
}
