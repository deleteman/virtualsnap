import ReactQuill, { Quill } from 'react-quill';
import QuillMention from 'quill-mention'
import "react-quill/dist/quill.core.css";
import "react-quill/dist/quill.core.css";
import "react-quill/dist/quill.snow.css";
import { useState } from 'react';



  
export default function PromptEditor({products, value}) {
    Quill.register('modules/mention', QuillMention)

    console.log("rendering prompt editor...")


    const modules = {
        toolbar: null,
        mention: {
          allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
          mentionDenotationChars: ['{'],

          source: function(searchTerm, renderList) {
            // your code to generate the dynamic list of words
            console.log("Searching...", products)
            if(searchTerm.length == 0) return renderList(products, searchTerm)
            //renderList([1,23,4])
          },
          onSelect: function(item, inserItem) {
            item.value += "}"
            inserItem(item, true)
          }
        }
      }
 


    return (
        <ReactQuill 
            modules={modules}  
            theme='snow' 
            value={value} 
            placeholder="Write a description of your product, something like 'a golden ring with an owl face, and rubies in the eyes'." 
        />
    )
}