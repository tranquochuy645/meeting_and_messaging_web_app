import { FC, memo, useState, useEffect, useRef } from "react";
import { ProfileData } from "../../pages/Main";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../SocketProvider";
import { deleteAccount } from "../../lib/deleteAccount";
import FileInput from "../FileInput";
import "./style.css";

interface ProfileProps {
  token: string;
  profileData: ProfileData | null;
  onRefresh: () => void;
}
// let socket:Socket;
const Profile: FC<ProfileProps> = ({ token, profileData, onRefresh }) => {
  // const [folded, setFolded] = useState(true);
  const [showInvitation, setShowInvitation] = useState<boolean>(false);
  const [showProfileEditor, setShowProfileEditor] = useState<boolean>(false);
  // const fileRef = useRef<any>(null);
  const avatarUrlRef = useRef<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const socket = useSocket()

  useEffect(() => {
    if (socket) {
      socket.on("inv", onRefresh);
      return () => {
        socket.off("inv", onRefresh);
      }
    }
  }, [socket]);
  useEffect(() => {
    if (editorRef.current) {
      if (showProfileEditor) {
        editorRef.current.classList.add("active");
      } else {
        editorRef.current.classList.remove("active");
      }
    }
  }, [showProfileEditor])

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
  const handleSubmit = async () => {
    if (!formRef.current) return;
    let body: any = {};
    if (formRef.current.bio.value) {
      body.bio = formRef.current.bio.value;
    }
    if (formRef.current.fullname.value) {
      body.fullname = formRef.current.fullname.value;
    }
    if (formRef.current.password.value) {
      body.password = formRef.current.password.value;
      if (formRef.current.current_password.value) {
        body.current_password = formRef.current.current_password.value;
      } else {
        return alert("Please enter current password");
      }
    }
    if (avatarUrlRef.current) {
      body.avatar = avatarUrlRef.current;
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

  const handleUploadImage = async (file: any) => {
    const formData = new FormData();
    formData.append('file', file)
    const res = await fetch(
      `/media/${profileData?._id}/public?token=${token}&count=1`,
      {
        method: 'POST',
        body: formData
      }
    )
    const data = await res.json();
    !res.ok && data.message && alert(data.message);
    if (data.urls) {
      avatarUrlRef.current = data.urls[0];
      handleSubmit();
    }
  }
  const handleDeleteAccount = async () => {
    try {
      const message = await deleteAccount(token);
      alert(message)
      navigate('/auth')
    } catch (message) {
      alert(message)
    }
  }
  return (
    <div id="profile">
      <div id="profile_topbar">
        <img
          src={profileData?.avatar}
          alt="Profile"
          id="profile_img"
          className="cover"
        />
        {
          showProfileEditor ?
            (
              <FileInput
                accept="image/*"
                onChange={handleUploadImage}
                id="upload-img"
                icon={
                  <i className='bx bxs-camera'></i>
                }
              />
            )
            :
            (<div>
              <h3>{profileData?.fullname}</h3>
              {profileData?.bio && <p>{profileData?.bio}</p>}
            </div>)
        }
        <div className="flex">
          {showProfileEditor ? (
            <button className="btn" onClick={() => setShowProfileEditor(false)}>
              <i className='bx bxs-message-square-x' ></i>
            </button>
          ) : (
            <button
              className="btn"
              onClick={() => setShowProfileEditor(true)}
            >
              <i className="bx bxs-pencil"></i>
            </button>
          )}

          <button
            className="btn"
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
          <button id="logout-btn" className="btn" onClick={handleLogout}>
            <i className="bx bx-log-in"></i>
          </button>
        </div>
      </div>
      <div ref={editorRef} id="profile_editor">
        <form id="profile_form" ref={formRef}>
          <div>
            <label htmlFor="fullname">Your name:</label>
            <input type="text" id="fullname" name="fullname" placeholder={profileData?.fullname} />
          </div>
          <div>
            <label htmlFor="bio">Bio:</label>
            <input type="text" id="bio" name="bio" placeholder={profileData?.bio} />
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
        </form>
        <div className="flex">
          <button id="btn_delete-account" onClick={handleDeleteAccount}>Delete account</button>
          <button id="btn_submit-edit" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default memo(Profile);
