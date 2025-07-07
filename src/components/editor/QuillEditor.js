import React, { useRef, useEffect, forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './QuillEditor.css';

// This is a compatibility wrapper for ReactQuill to work with React 19
// It addresses the findDOMNode deprecation by using refs
const QuillEditor = forwardRef(({ value, onChange, placeholder, modules, formats, className, ...props }, ref) => {
  const editorRef = useRef(null);
  
  // Forward the ref to parent components if needed
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(editorRef.current);
      } else {
        ref.current = editorRef.current;
      }
    }
  }, [ref]);

  // Monkey patch ReactQuill to avoid findDOMNode error
  useEffect(() => {
    if (ReactQuill.prototype.getEditingArea && !ReactQuill.prototype._getEditingArea) {
      // Save original method
      ReactQuill.prototype._getEditingArea = ReactQuill.prototype.getEditingArea;
      
      // Replace with a ref-based approach
      ReactQuill.prototype.getEditingArea = function() {
        if (this.editingArea) return this.editingArea;
        
        // Find editing area directly from the component's DOM structure
        if (this.editorContainer) {
          this.editingArea = this.editorContainer.querySelector('.ql-editor');
          return this.editingArea;
        }
        
        return null;
      };
    }
    
    // Also patch the instantiateEditor method if needed
    if (ReactQuill.prototype.instantiateEditor && !ReactQuill.prototype._instantiateEditor) {
      ReactQuill.prototype._instantiateEditor = ReactQuill.prototype.instantiateEditor;
      
      ReactQuill.prototype.instantiateEditor = function() {
        try {
          // Try the original method first
          return this._instantiateEditor();
        } catch (error) {
          // If it fails due to findDOMNode, use our own implementation
          console.warn('Using fallback for ReactQuill instantiateEditor');
          
          if (!this.editorContainer) {
            // Find the editor container manually
            const node = ReactQuill.findDOMNode(this);
            if (node) {
              this.editorContainer = node.querySelector('.quill');
            }
          }
          
          if (this.editorContainer) {
            // Create Quill instance manually
            const quill = new window.Quill(this.editorContainer, this.getEditorConfig());
            
            // Set up change handler
            quill.on('text-change', this.handleChange);
            
            return quill;
          }
          
          throw new Error('Could not instantiate Quill editor');
        }
      };
    }
  }, []);

  return (
    <div className={`quill-editor-container ${className || ''}`}>
      <ReactQuill
        ref={editorRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        theme="snow"
        {...props}
      />
    </div>
  );
});

QuillEditor.displayName = 'QuillEditor';

// Default modules configuration
QuillEditor.defaultProps = {
  modules: {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  },
  formats: [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image'
  ]
};

export default QuillEditor; 