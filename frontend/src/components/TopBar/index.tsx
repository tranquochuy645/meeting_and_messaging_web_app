import { FC, memo, useState, useEffect, useRef } from "react";
import { getProfile, ProfileData } from "../../pages/Main";
import { getSocket } from "../../SocketController";
import { Socket } from "socket.io-client";
import PendingFigure from "../PendingFigure";
import ThemeSwitch from "../ThemeSwitch";
import { useNavigate } from "react-router-dom";
import './style.css';

interface TopBarProps {
  token: string;
  profileData: ProfileData | null;
}

const TopBar: FC<TopBarProps> = ({ token, profileData }) => {
  const [data, setData] = useState<ProfileData | null>(profileData);
  const [showInvitation, setShowInvitation] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fullnameInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  const refreshProfile = () => {
    getProfile(token)
      .then((data) => setData(data))
      .catch(
        (error) => {
          console.error(error)
          navigate("/auth")
        }
      );
  };

  useEffect(() => {
    if (token) {
      const socket = getSocket(token);
      socket.on("inv", refreshProfile);
      socketRef.current = socket
    }
    return () => {
      socketRef.current?.disconnect();
    }
  }, [token]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate("/auth");
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      // Perform accept invitation logic
      console.log("Accepted invitation:", invitationId);
      const response = await fetch(
        `/api/rooms/${invitationId}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            "authorization": "Bearer " + token
          },
          body: JSON.stringify({
            accept: true
          })
        }
      );
      if (response.ok) {
        alert("ok");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRefuseInvitation = async (invitationId: string) => {
    try {
      // Perform refuse invitation logic
      console.log("Refused invitation:", invitationId);
      const response = await fetch(
        `/api/rooms/${invitationId}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            "authorization": "Bearer " + token
          },
          body: JSON.stringify({
            accept: false
          })
        }
      );
      if (response.ok) {
        alert("ok");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateFullname = async () => {
    try {
      // Perform the fullname update logic
      const newName = fullnameInputRef.current?.value;
      const response = await fetch(`/api/users/`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer " + token
        },
        body: JSON.stringify({
          fullname: newName
        })
      });
      if (response.ok) {
        refreshProfile()
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateAvatar = () => {
    if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      const file = fileInputRef.current.files[0];
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

            try {
              // Perform the avatar update logic
              const response = await fetch(`/api/users/`, {
                method: "PUT",
                headers: {
                  "content-type": "application/json",
                  "authorization": "Bearer " + token
                },
                body: JSON.stringify({
                  avatar: resizedBase64Data
                })
              });

              if (response.ok) {
                refreshProfile();
              }
            } catch (error) {
              console.error(error);
            }
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
      <header>
        <div id="profile">
          {data && data.avatar ? (
            <>
              <img src={data.avatar} alt="Profile" id="profile_img" />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUpdateAvatar}
              />
            </>
          ) : (
            <PendingFigure size={30} />
          )}
          <div id="profile_info">
            {data && data.fullname ? (
              <>
                <h3>{data.fullname}</h3>
                <input
                  type="text"
                  ref={fullnameInputRef}
                />
                <button onClick={handleUpdateFullname}>
                  Change Fullname
                </button>
              </>
            ) : (
              <PendingFigure size={30} />
            )}
          </div>
        </div>
        <button
          onClick={() => setShowInvitation(
            (prev) => !prev)}
        >
          {showInvitation ? "X" : `Show invitations (${data?.invitations.length})`}
        </button>
        {
          showInvitation && <div>
            {data && data.invitations.length > 0 ? (
              data.invitations.map((invitation: string) => (
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
        }
        <div className="flex">
          <ThemeSwitch />
          <button id="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
    </>
  );
};

export default memo(TopBar);
