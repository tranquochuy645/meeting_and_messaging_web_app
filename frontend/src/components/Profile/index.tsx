import { FC, memo, useState, useEffect, useRef } from "react";
import { ProfileData } from "../../pages/Main";
import { getSocket } from "../../SocketController";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "./style.css";

interface ProfileProps {
  token: string;
  profileData: ProfileData | null;
  onRefresh: () => void;
}

const TopBar: FC<ProfileProps> = ({ token, profileData, onRefresh }) => {
  const [showInvitation, setShowInvitation] = useState<boolean>(false);
  const [showProfileEditor, setShowProfileEditor] = useState<boolean>(false);
  const fileRef = useRef<any>(null);
  const imageDataRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const socket = getSocket(token);
      socket.on("inv", onRefresh);
      socketRef.current = socket;
    }
    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/auth");
  };

  const handleAcceptInvitation = (invitationId: string) => {
    fetch(`/api/v1/rooms/${invitationId}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        accept: true,
      }),
    });
  };

  const handleRefuseInvitation = (invitationId: string) => {
    fetch(`/api/v1/rooms/${invitationId}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        accept: false,
      }),
    });
  };
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    let body: any = {};
    if (event.target.bio.value) {
      body.bio = event.target.bio.value;
    }
    if (event.target.fullname.value) {
      body.fullname = event.target.fullname.value;
    }
    if (event.target.password.value) {
      body.password = event.target.password.value;
      if (event.target.current_password.value) {
        body.current_password = event.target.current_password.value;
      } else {
        return alert("Please enter current password");
      }
    }
    if (imageDataRef.current) {
      body.avatar = imageDataRef.current;
    }
    if (!body.bio && !body.fullname && !body.password && !body.avatar) {
      return alert("Empty form");
    }
    const response = await fetch(`/api/v1/users/`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    });
    setShowProfileEditor(false);
    if (response.ok) {
      alert("Updated successfully!");
      return onRefresh();
    }
    const data = await response.json();
    if (data.message) {
      return alert(data.message);
    }
    alert("Error updating profile");
  };
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account?"
    );
    if (confirmed) {
      const password = window.prompt("Enter your password:");

      if (password !== null) {
        try {
          const body = { password };
          const response = await fetch(`/api/v1/users/`, {
            method: "DELETE",
            headers: {
              "content-type": "application/json",
              authorization: "Bearer " + token,
            },
            body: JSON.stringify(body),
          });

          if (response.ok) {
            sessionStorage.removeItem("token");
            alert("You deleted your account successfully");
            navigate("/auth");
          } else {
            const data = await response.json();
            if (data.message) {
              alert(data.message);
            } else {
              alert("Wrong password!");
            }
          }
        } catch (error) {
          console.error("Error deleting account:", error);
        }
      }
    }
  };

  const handleUploadImage = () => {
    if (fileRef?.current && fileRef.current.length > 0) {
      const file = fileRef.current.files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        if (event.target?.result) {
          const image = new Image();
          image.onload = async () => {
            const canvas = document.createElement("canvas");
            const maxWidth = 200; // Set the desired maximum width
            const maxHeight = 200; // Set the desired maximum height
            let width = image.width;
            let height = image.height;

            // Determine the new dimensions while maintaining aspect ratio
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }

            // Resize the image using the canvas
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(image, 0, 0, width, height);

            // Convert the resized image back to base64
            const resizedBase64Data = canvas.toDataURL("image/jpeg");
            imageDataRef.current = resizedBase64Data;
          };

          // Load the image
          image.src = event.target.result as string;
        }
      };

      // Read the file as a data URL
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div id="profile">
        <img
          src={profileData?.avatar}
          alt="Profile"
          id="profile_img"
          className="cover"
        />
        {showProfileEditor ? (
          <>
            <input
              id="btn_upload-img"
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleUploadImage}
            />
            <button className="btn_profile" onClick={() => setShowProfileEditor(false)}>
              <i className="bx bxs-pencil"></i>
            </button>
          </>
        ) : (
          <>
            <div>
              <h3>{profileData?.fullname}</h3>
              {profileData?.bio && <p>{profileData?.bio}</p>}
            </div>
            <button
              className="btn_profile"
              onClick={() => setShowProfileEditor(true)}
            >
              <i className="bx bxs-pencil"></i>
            </button>
          </>
        )}

        <button
          className="btn_profile"
          onClick={() => setShowInvitation((prev) => !prev)}
        >

          {showInvitation ? (
            <i className='bx bxs-message-square-x' ></i>
          ) : (
            <div id="bell">
              <i className="bx bxs-bell"></i>
              {profileData?.invitations.length &&
                profileData?.invitations.length > 0 ? (
                <span id="nofcount">{profileData?.invitations.length}</span>
              ) : null}
            </div>
          )}
        </button>
        {showInvitation && (
          <div id="notify-container">
            {profileData && profileData.invitations.length > 0 ? (
              profileData.invitations.map((invitation: string) => (
                <div key={invitation}>
                  <p>{invitation}</p>
                  <button onClick={() => handleAcceptInvitation(invitation)}>
                    Accept
                  </button>
                  <button onClick={() => handleRefuseInvitation(invitation)}>
                    Refuse
                  </button>
                </div>
              ))
            ) : (
              <p>No invitations</p>
            )}
          </div>
        )}
        <button id="logout-btn" className="btn_profile" onClick={handleLogout}>
          <i className="bx bx-log-in"></i>
        </button>
      </div>
      {showProfileEditor && (
        <>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullname">Your name:</label>
              <input type="text" id="fullname" name="fullname" />
            </div>
            <div>
              <label htmlFor="bio">Bio:</label>
              <input type="text" id="bio" name="bio" />
            </div>
            <div>
              <label htmlFor="current_password">Current password:</label>
              <input
                type="password"
                id="current_password"
                name="current_password"
              />
            </div>
            <div>
              <label htmlFor="password">New password:</label>
              <input type="password" id="password" name="password" />
            </div>

            <button type="submit">Save</button>
          </form>
          <button onClick={handleDeleteAccount}>Delete account</button>
        </>
      )}
    </>
  );
};

export default memo(TopBar);
