import * as React from 'react';
import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, TextField, Typography, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Stack, IconButton, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TablePagination
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
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

const STORAGE_KEY = "demo_articles_v1";

const loadArticles = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export default function AdminMain() {
    const [articles, setArticles] = useState([]);
    const [filter, setFilter] = useState("");
    const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });
    const [page, setPage] = React.useState(2);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const startEdit = (row) => {
        return;
    };
    const askDelete = (row) => {
        return;
    };
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('temp.txt');
                if (!response.ok) {
                    throw new Error(`Error, Status: ${response.status}`);
                }

                const tableContent = await response.text();

                localStorage.setItem('demo_articles_v1', tableContent);
            } catch (error) {
                console.error("Error: ", error);
            }
        }
        loadData();
    }, []);

    useEffect(() => { setArticles(loadArticles()); }, []);

    const filtered = useMemo(() => {
        const q = filter.trim().toLowerCase();
            if (!q) return articles;
                return articles.filter(a =>
                    a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
                    );
  }, [articles, filter]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box p={{ xs: 2, md: 3, mb: 5 }} maxWidth="1000px" mx="auto">
            <Typography sx={10} variant="h5">
                Welcome, Tanjila
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Return to Home  
            </Button>
            <Button variant="outlined">
                User Management
            </Button>
            <Button variant="outlined">
                Publishing
            </Button>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mb={1}>
            <TextField
            size="small"
            label="Search articles"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ maxWidth: 360 }}
            />
            <Box flex={1} />
        </Stack>
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
                    {/* Edit and Delete buttons */}
                  <IconButton onClick={() => navigate('/admin')}>
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
        <Box>
            <TablePagination
                component="div"
                count={10}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPage={rowsPerPage}>
            </TablePagination>
        </Box>
    </Paper>
</Box>
    );
}