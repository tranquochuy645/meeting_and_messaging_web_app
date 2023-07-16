import { FC, memo, useState, useEffect } from "react";
import { getProfile, ProfileData } from "../../pages/Main";
import { getSocket } from "../../SocketController";
import PendingFigure from "../PendingFigure";
import ThemeSwitch from "../ThemeSwitch";
import './style.css';

interface SideBarProps {
  token: string;
  profileData: ProfileData | null;
}



const TopBar: FC<SideBarProps> = ({ token, profileData }) => {
  const [data, setData] = useState<ProfileData | null>(profileData);
  const [showInvitation, setShowInvitation] = useState<boolean>(false);

  const handleNewInvitation = () => {
    getProfile(token)
      .then((data) => setData(data))
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    if (token) {
      const socket = getSocket(token);
      socket.on("inv", handleNewInvitation);
    }
  }, [token]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    window.location.reload();
  };

  const handleAcceptInvitation = (invitationId: string) => {
    // Perform accept invitation logic
    console.log("Accepted invitation:", invitationId);
    fetch(
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
    )
  };

  const handleRefuseInvitation = (invitationId: string) => {
    // Perform refuse invitation logic
    console.log("Refused invitation:", invitationId);
    fetch(
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
    )
  };

  return (
    <>
      <header>
        <div id="profile">
          {data && data.avatar ? (
            <img src={data.avatar} alt="Profile" id="profile_img" />
          ) : (
            <PendingFigure size={30} />
          )}
          <div id="profile_info">
            {data && data.fullname ? (
              <h3>{data.fullname}</h3>
            ) : (
              <PendingFigure size={30} />
            )}
          </div>
        </div>
        <button
          onClick={() => setShowInvitation(
            (prev) => !prev)}
        >{showInvitation ? "X" : `Show invitations (${data?.invitations.length})`}
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
