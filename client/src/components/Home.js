import React, { useState } from "react";
import axios from "axios";

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [shortLink, setShortLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errFound, setErrFound] = useState({});

  // Making request to rebrandly to shorten URL that amazon S3 sent back to us
  const urlShortener = (url) => {
    let linkRequest = {
      destination: url,
      domain: { fullName: "rebrand.ly" },
    };

    let requestHeaders = {
      "Content-Type": "application/json",
      apikey: "212d576f073c418db5bb708cd0c65359",
      workspace: "39b3836da6a94b7e87e00b1e27b391bb",
    };

    axios({
      url: "https://api.rebrandly.com/v1/links",
      method: "post",
      data: JSON.stringify(linkRequest),
      headers: requestHeaders,
      dataType: "json",
    })
      .then((response) => {
        console.log(
          `Long URL was ${response.data.destination}, short URL is ${response.data.shortUrl}`
        );
        setShortLink(response.data.shortUrl);
      })
      .catch((err) => {
        setErrFound({ message: err });
      });
  };

  const singleFileUploadHandler = (event) => {
    setUploading(true);
    setErrFound({});
    setShortLink("");

    const data = new FormData();
    // If file selected
    if (selectedFile) {
      data.append("Image", selectedFile, selectedFile.name);
      axios
        .post("/api/img-upload", data, {
          headers: {
            accept: "application/json",
            "Accept-Language": "en-US,en;q=0.8",
            "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
          },
        })
        .then((response) => {
          if (200 === response.status) {
            // If file size is larger than expected.
            if (response.data.error) {
              if ("LIMIT_FILE_SIZE" === response.data.error.code) {
                setUploading(false);
                setErrFound({ message: "Max Size is 10MB" });
                // ocShowAlert("Max size: 10MB", "red");
              } else {
                setUploading(false);
                // If not the given file type
                setErrFound({ message: response.data.error });
              }
            } else {
              // Success
              let fileName = response.data;
              urlShortener(fileName.location);
              setUploading(false);
              setSelectedFile(null);
            }
          }
        })
        .catch((error) => {
          setUploading(false);
          // If another error
          setErrFound({ message: error });
        });
    } else {
      setUploading(false);
      // if file not selected throw error
      setErrFound({ message: "Plz select a file" });
    }
  };

  return (
    <div className="container">
      {errFound.message && (
        <div class="alert alert-danger" role="alert">
          {errFound.message}
        </div>
      )}

      <div
        className="card border-light mb-3 mt-5"
        style={{ boxShadow: "0 5px 10px 2px rgba(195,192,192,.5)" }}
      >
        <div className="card-header">
          <h3 style={{ color: "#555", marginLeft: "12px" }}>
            Single Image Upload
          </h3>
          <p className="text-muted" style={{ marginLeft: "12px" }}>
            Upload Size:( Max 10MB )
          </p>
        </div>
        <div className="card-body">
          <p className="card-text">Please upload an image</p>
          <input
            type="file"
            onChange={(event) => {
              setSelectedFile(event.target.files[0]);
            }}
          />
          <div className="mt-5">
            <button className="btn btn-info" onClick={singleFileUploadHandler}>
              {uploading ? "Uploading" : "Upload"}
            </button>
          </div>
        </div>
      </div>
      {shortLink && (
        <div class="alert alert-success" role="alert">
          File sucessfully uploaded and is available here
          <a href={"https://" + shortLink}> {shortLink}</a>
        </div>
      )}
    </div>
  );
};

export default Home;
