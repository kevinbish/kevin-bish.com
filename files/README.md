# The evidence locker

Everything in this folder is public: it is listed in the **Files & Documents** section of kevin-bish.com
and anyone can download it.

## Add a file

1. On GitHub, open this `files` folder, then the folder you want (for example `papers`).
   To make a new folder, choose **Add file → Create new file** and type `newfolder/` before the name,
   or upload with the folder already in the file's path.
2. Choose **Add file → Upload files**, drop the file in, and **Commit changes** to `main`.
   (GitHub's website accepts files up to 25 MB each.)
3. That's it. The **Update locker** GitHub Action rebuilds the listing within a minute or two,
   and Plesk deploys it.

## Add a description (optional)

Edit `locker.json` and add a line under `"descriptions"`, keyed by the path inside `files/`:

```json
"descriptions": {
  "papers/my-report.pdf": "One sentence about the file"
}
```

Keep the commas between lines, and no comma after the last one.

## Remove or rename a file

Delete or rename it on GitHub. The listing updates the same way.

Names, types, sizes and dates are read from the files themselves; the date is when the file was last committed.
Folders show up automatically once they contain a file. `README.md` and `locker.json` are never listed.
