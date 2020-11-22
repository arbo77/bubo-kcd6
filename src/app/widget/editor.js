import React, { useEffect, useState } from "react";
import Dante from "Dante2";
import { post } from "axios";
import { h1 } from "../helper/poc";
// import Icons from "Dante2/package/lib/components/icons"
import { ImageBlockConfig } from "Dante2/package/lib/components/blocks/image";
import { VideoBlockConfig } from "Dante2/package/lib/components/blocks/video";
import { EmbedBlockConfig } from "Dante2/package/lib/components/blocks/embed";
import { PlaceholderBlockConfig } from "Dante2/package/lib/components/blocks/placeholder";

const my_custom_callback = (file) => {
  const url = "https://api.bubo.id/media";
  const formData = new FormData();
  formData.append("media", file);
  formData.append("folder", "content");
  const config = {
    headers: {
      "content-type": "multipart/form-data",
      Authorization:
        "Bearer AG8BCncaaB87gxICZMADlCFE7oHbhYjUHvHvDKVxZ4bu95koAHj3Ir_TPaeooFDDPLHtHkhbdGfIxSkA_BO860PfAEtUu1e0E0jVTMQd5ZgFcWEcBvtK8g1P5ToqBKoEecAYsyYNcIOUT9f08w0GCRy-ejU57pqbttu1XS8K9cTuIwWGVxRL1H-WBIrPuVP1BhMHR4Ms6ZyGRHZFfXJWc07nbHXzjNRGGGGAo9xFW0TClWF1mkoqbO_xHPC5LBwcN05CyZ27KL_Hj6Y2FU7XFMHlo9SSZE3Vc9Zk_wLKmOSF1NKidXGM6cXgUqCZKqCebDU4wITDwretOkEj87wECN6xqj3z1L2JIhvlMru_bcioG0jNEnrM9-eoYKfk8xDLmU0NkDfrBMyOFT96nQY3NCWaaPiG3oImxw"
    }
  };
  return post(url, formData, config);
};

const ContentEditor = ({ ...props }) => {
  // console.log({ propsEditor: props })
  const [content, setContent] = useState(
    props.setContent != null ? props.setContent : h1
  );
  const loadContent = () => {
    setContent(props.setContent);
  };
  useEffect(() => {
    loadContent();
  }, [props.setContent]);
  // console.log({ content })
  return (
    <div>
      <Dante
        content={content}
        body_placeholder={
          props.placeholder ? props.placeholder : "Tuliskan Disini ..."
        }
        default_wrappers={[
          { className: "overide-h1 graf--h2", block: "header-one" }
        ]}
        onChange={props.handleChangeContent}
        // continuousBlocks={['uns']}
        read_only={props.read}
        widgets={[
          ImageBlockConfig({
            options: {
              upload_handler: async (file, imageBlock) => {
                try {
                  const res = await my_custom_callback(file);
                  const data = res.data.data;
                  console.log({ res });
                  // imageBlock.uploadCompleted(data.secure_url);
                  imageBlock.uploadCompleted(data.secure_url); //  this needed to update editor state
                } catch (e) {
                  imageBlock.uploadFailed(); //  this needed to update editor state
                }
              }
            }
          }),
          VideoBlockConfig({
            options: {
              endpoint:
                "//open.iframe.ly/api/oembed?origin=https://github.com&url=",
              placeholder:
                "Paste a YouTube, Vine, Vimeo, or other video link, and press Enter",
              caption: "Type caption for embed (optional)"
            }
          }),
          EmbedBlockConfig({
            options: {
              endpoint:
                "//open.iframe.ly/api/oembed?origin=https://github.com&url=",
              placeholder:
                "Paste a link to embed content from another site (e.g. Ebook file, Twitter, etc) and press Enter"
            }
          }),
          PlaceholderBlockConfig()
        ]}
      />
    </div>
  );
};

export default {
  Content: ContentEditor
};
