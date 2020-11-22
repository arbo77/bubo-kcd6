import FineUploaderTraditional from "fine-uploader-wrappers";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef
} from "react";
import ReactDOM from "react-dom";
import Gallery from "react-fine-uploader";
import "react-fine-uploader/gallery/gallery.css";

export const UploaderFile = forwardRef(({ onResUpload, ...props }, ref) => {
  var uploadUrl = [];

  const fileInputChildren = <span>Pilih File</span>;
  const cancelBtn = <span style={{ display: "none" }}>anu</span>;
  const refUpload = useRef();

  useEffect(() => {
    const frameUpload = ReactDOM.findDOMNode(refUpload.current);
    if (frameUpload instanceof HTMLElement) {
      const dropZone = frameUpload.querySelector(
        ".react-fine-uploader-gallery-dropzone-content"
      );
      if (dropZone !== null) dropZone.style.display = "none";
    }
  });

  useImperativeHandle(ref, () => ({
    startUpload() {
      uploader.methods.uploadStoredFiles();
      const frameUpload = ReactDOM.findDOMNode(refUpload.current);
      if (frameUpload instanceof HTMLElement) {
        const dropZone = frameUpload.querySelector(
          ".react-fine-uploader-file-input-container"
        );
        if (dropZone !== null) dropZone.style.display = "none";
      }
    }
  }));

  const hideProgress = () => {
    const frameUpload = ReactDOM.findDOMNode(refUpload.current);
    if (frameUpload instanceof HTMLElement) {
      const dropZone = frameUpload.querySelector(
        ".react-fine-uploader-total-progress-bar-container"
      );
      if (dropZone !== null) dropZone.style.display = "none";
    }
  };

  const removeUpload = (name) => {
    if (name !== undefined) {
      var resFilter = uploadUrl.filter(function (el) {
        return el.source != name;
      });
      uploadUrl = resFilter;
      onResUpload(uploadUrl);
    }
  };

  const uploader = new FineUploaderTraditional({
    options: {
      multiple: true,
      callbacks: {
        onCancel: function (id, name) {
          // console.log(id)
          // console.log(name)
          removeUpload(name);
        },
        onError: function (id, name, errorReason, xhrOrXdr) {
          // console.log('onError')
          // console.log(id)
          // console.log(name)
          // console.log(errorReason)
          // console.log(xhrOrXdr)
        },
        onStatusChange: function (id, oldStatus, newStatus) {
          hideProgress();
        },
        onComplete: function (id, name, responseJSON, xhr) {
          // console.log('onComplete')
          // console.log(id)
          // console.log(name)
          console.log(responseJSON);
          // console.log(xhr)
          if (responseJSON.success && responseJSON.data.url.length > 4) {
            var file = {
              source: responseJSON.data.source,
              url: responseJSON.data.url,
              secure_url: responseJSON.data.secure_url
            };
            // hideErrUpload(true)
            uploadUrl.push(file);
          }
        },
        onAllComplete: function (succeeded, failed) {
          onResUpload(uploadUrl);
        }
      },
      request: {
        endpoint: "https://api.bubo.id/media",
        customHeaders: {
          Authorization:
            "Bearer AG8BCnen9HniOkOKnyf8DrnhCxV7mSw4pCSprtYOCyskjYv-YSz2zxRah03LcXVWLB0xg62TwLhA9gPQJC8_dap2tN7A1B7jEeyzxsyLo81uC7LLSap_6N2pmzuPVvjPUrZj80olGKs2wMNi-cj2lpFTBZ8oJU-ZsIkhZFSLwefEIIyqdHxINus4Ze9OBjmQh6jFw500DfxtHNCeB_D-e9sDwjGX16L23PsMQWUweh0y98GdXMHxpPe2x_AfgpgViDU98TWpBGghZ0sKnrDtCk-qu7mHfjyI6GspRX9ypA1trfNG1torqp20nW-PLVAIMi5vu9yLFvAAnvqoRIn51c0fjMRvfJQLqgrVG2iZdWVNHD-j0SUOXAxYegKNK1kRArKs7tPhTomxMDWSpg2_SXX8-6TImcdQ6g"
        },
        inputName: "media"
      },
      autoUpload: false,
      validation: {
        allowedExtensions: [
          "jpeg",
          "jpg",
          "txt",
          "doc",
          "docx",
          "png",
          "pdf",
          "xls",
          "xlsx",
          "ppt",
          "pptx"
        ]
        // itemLimit: 3
        // sizeLimit: 51200 // 50 kB = 50 * 1024 bytes
      },
      retry: {
        enableAuto: true
      }
    }
  });
  return (
    <Gallery
      ref={refUpload}
      fileInput-children={fileInputChildren}
      uploader={uploader}
      cancelButton-children={cancelBtn}
      retryButton-children={cancelBtn}
    />
  );
});
