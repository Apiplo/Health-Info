import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, TextField, Typography, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Stack, IconButton, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TablePagination
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { TextAlign } from "@tiptap/extension-text-align";
import { useEditor } from "@tiptap/react";
import {
  MenuButtonBold, MenuButtonItalic,  
  MenuSelectTextAlign, MenuControlsContainer, RichTextField,
  RichTextEditorProvider, MenuSelectFontSize, MenuDivider,
} from "mui-tiptap";
import axios from "axios"

// Temporary "database"
const STORAGE_KEY = "demo_articles_v1";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1NTc1ODQ2MywiZXhwIjoxNzU1ODQ0ODYzfQ.wXByFB2WsP7obUUKZrr7dg5g1b0ISceQyP0czaADkcg";

// Load saved article from DB
const loadArticles = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};


// Save articles to DB
const saveArticles = (rows) => localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));

// Unique IDs for new articles
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// Helpers
const emptyForm = { title: "", content: "", image_url: "" };
const nowISO = () => new Date().toISOString();

export default function AdminArticles() {
  const [articles, setArticles] = useState([]); // list of articles
  const [form, setForm] = useState(emptyForm); // form input values
  const [editingId, setEditingId] = useState(null); // check if editing existing article
  const [filter, setFilter] = useState(""); // search filter
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" }); //feedback msg
  const [confirm, setConfirm] = useState({ open: false, id: null }); //confirm delete dialogue

  useEffect(() => { setArticles(loadArticles()); }, []); //load articles
  useEffect(() => { saveArticles(articles); }, [articles]); //save articles whenever they change

  // Filter list of articles on search box
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(a =>
      a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
    );
  }, [articles, filter]);

  // Update the form values when having new input
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit (add or update article)
  const submit = async (e) => {
    e.preventDefault();
    form.content = JSON.parse(JSON.stringify(editor.getJSON()));
    // Validate required fields
    if (!form.title.trim() || !editor.getText().trim()) {
      return setToast({ open: true, msg: "Title and content are required.", severity: "warning" });
    }

    if (editingId) {
    // Update existing article
      setArticles(prev =>
        prev.map(a => a.id === editingId ? { ...a, ...form, updated_at: nowISO() } : a)
      );
      setToast({ open: true, msg: "Article updated.", severity: "success" });
      setEditingId(null);
    } else {
    // Add new article
      const newRow = {
        id: uid(),
        title: form.title.trim(),
        content: JSON.parse(JSON.stringify(editor.getJSON())),
        image_url: form.image_url.trim() || "",
        created_at: nowISO(),
        updated_at: nowISO(),
      };
     
      setArticles(prev => [newRow, ...prev]);
      setToast({ open: true, msg: "Article added.", severity: "success" });
      try {
        await axios.post("http://localhost:3000/api/articles", form, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      } catch (err) {
        console.log(err.response);
      }
    }

    // Reset form after save
    setForm(emptyForm);
    editor.commands.clearContent();
  };

  // Fill forms with existing values
  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({ title: row.title, content: editor.commands.setContent(row.content), image_url: row.image_url || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Confirm delete dialogue
  const askDelete = (id) => setConfirm({ open: true, id });

  // Delete article after confirm
  const doDelete = () => {
    setArticles(prev => prev.filter(a => a.id !== confirm.id));
    setToast({ open: true, msg: "Article deleted.", severity: "info" });
    setConfirm({ open: false, id: null });
  };

  // Cancel edit and reset form
  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    editor.commands.clearContent();
  };

  /* Creates an editor for the RichTextField in the form body (allows you to edit
     what things the editor has like if it can bold etc) */
  const editor = useEditor({
    extensions: [StarterKit, TextStyleKit, TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right'],
      defaultAlignment: ['left'],
    })],
    editorProps: {
      scrollThreshold: 5,
      scrollMargin: 5,
    },
  });

  const handleEditorClickEvent = () => {
    if (editor && !editor.isFocused) {
      editor.commands.focus('end')
    }
  };

  return (
   
    <Box p={{ xs: 2, md: 3 }} maxWidth="1000px" mx="auto">

      <Typography variant="h5" mb={2}>Admin • Articles</Typography>

      {/* Add / Edit Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" mb={1}>
          {editingId ? "Edit Article" : "Add Article"}
        </Typography>
        <Box component="form" onSubmit={submit}>
          <Stack spacing={2}>
            {/* Tilte input */}
            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={onChange}
              required
            />
            {/* Content input */}
            <RichTextEditorProvider
              editor={editor}>
              <RichTextField
                controls={ 
                  <MenuControlsContainer>
                    <MenuButtonBold />
                    <MenuButtonItalic />
                      <MenuDivider />                    
                    <MenuSelectTextAlign />
                      <MenuDivider />
                    <MenuSelectFontSize />
                  </MenuControlsContainer>
                }
                sx={{
                  maxHeight: "max-content",
                  minHeight: 750,
                  maxWidth: "auto",
                  overflow: "auto",
                  wordWrap: "break-word",
                  textWrap: "wrap",
                  blockSize: 750,
                }}
                onClick={handleEditorClickEvent}
                onChange={onChange}
                required
              />
              
            </RichTextEditorProvider>
            {/* Image input */}
            <TextField
              label="Image URL (optional)"
              name="image_url"
              value={form.image_url}
              onChange={onChange}
              placeholder="https://example.com/image.jpg"
            />
            {/* Submit + Cancel buttons */}
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained">
                {editingId ? "Save Changes" : "Publish"}
              </Button>
              {editingId && (
                <Button onClick={cancelEdit} variant="text">Cancel</Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Paper>

{/*      Search and clear
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mb={1}>
        <TextField
          size="small"
          label="Search articles"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ maxWidth: 360 }}
        />
        <Box flex={1} />
        <Button
          onClick={() => {
            if (!window.confirm("Reset demo data? This will clear all saved articles.")) return;
            setArticles([]);
            setToast({ open: true, msg: "Storage cleared.", severity: "info" });
          }}
          variant="outlined"
        >
          Clear All
        </Button>
      </Stack>

     Article table
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "40%" }}>Title</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Image</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id} hover>
                <TableCell>{a.title}</TableCell>
                <TableCell>{new Date(a.created_at).toLocaleString()}</TableCell>
                <TableCell>{a.image_url ? "Yes" : "—"}</TableCell>
                <TableCell align="right">
                    Edit and Delete buttons
                  <IconButton onClick={() => startEdit(a)} aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => askDelete(a.id)} aria-label="delete" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  No articles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
*/}
      {/* Delete Confirm */}
      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null })}>
        <DialogTitle>Delete article?</DialogTitle>
        <DialogContent>
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false, id: null })}>Cancel</Button>
          <Button color="error" onClick={doDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Feedback msg */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
