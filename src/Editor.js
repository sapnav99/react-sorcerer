import React, { useState } from "react";
import {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  getDefaultKeyBinding,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "./Editor.css";

const MyEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const handleBeforeInput = (chars, editorState) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const block = currentContent.getBlockForKey(selection.getStartKey());
    const start = selection.getStartOffset();
    const end = selection.getEndOffset();
    const text = block.getText().slice(start - 1, end);

    if (chars === " " && start === 1 && text === "#") {
      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: start,
        }),
        ""
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );

      const updatedEditorState = RichUtils.toggleBlockType(
        newEditorState,
        "header-one"
      );

      setEditorState(updatedEditorState);
      return "handled";
    }

    if (chars === " " && (text === "*" || text === "**" || text === "***")) {
      const asterisksToRemove = text === "***" ? 3 : 3;

      const newContentState = Modifier.replaceText(
        currentContent,
        selection.merge({
          anchorOffset: start - asterisksToRemove,
          focusOffset: end,
        }),
        ""
      );

      let newEditorState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );
      if (text === "*") {
        newEditorState = RichUtils.toggleInlineStyle(newEditorState, "BOLD");
      } else if (text === "**") {
        const contentWithRedColor = Modifier.applyInlineStyle(
          newContentState,
          selection,
          "RED_COLOR"
        );
        newEditorState = EditorState.push(
          editorState,
          contentWithRedColor,
          "change-inline-style"
        );
      } else if (text === "***") {
        newEditorState = RichUtils.toggleInlineStyle(
          newEditorState,
          "UNDERLINE"
        );
      }

      setEditorState(newEditorState);
      return "handled";
    }

    return "not-handled";
  };

  const keyBindingFn = (e) => {
    if (e.key === " ") {
      const selection = editorState.getSelection();
      const currentContent = editorState.getCurrentContent();
      const block = currentContent.getBlockForKey(selection.getStartKey());
      const start = selection.getStartOffset();
      const end = selection.getEndOffset();
      const text = block.getText().slice(start, end);

      if (text === "*" || text === "**" || text === "***") {
        return "remove-formatting";
      }
    }

    return getDefaultKeyBinding(e);
  };

  const onEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const rawContentState = JSON.stringify(contentState);

    localStorage.setItem("editorContent", rawContentState);

    console.log("Content saved:", contentState);
  };

  return (
    <div className="Editor">
      <div className="header">
        <div className="label-container">
          <label>Demo editor by Sapna</label>
        </div>
        <div className="buttons">
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
      <div className="input-area">
        <Editor
          editorState={editorState}
          handleBeforeInput={handleBeforeInput}
          keyBindingFn={keyBindingFn}
          onChange={onEditorChange}
        />
      </div>
    </div>
  );
};

export default MyEditor;
