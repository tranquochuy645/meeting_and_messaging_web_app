import PendingFigure from "../PendingFigure";
import ThemeSwitch from "../ThemeSwitch";
import { FC, memo } from "react";
import { ProfileData } from "../../pages/Main";
import './style.css'
interface SideBarProps {
  profileData: ProfileData | null;
}

const TopBar: FC<SideBarProps> = ({ profileData }) => {
  console.log("top")
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    window.location.reload();
  }

  return (
    <>
      <header>
        <div id="profile">
          {profileData && profileData.avatar ? (
            <img src={profileData.avatar} alt="Profile" id="profile_img" />
          ) : (
            <PendingFigure size={30} />
          )}
          <div id="profile_info">
            {profileData && profileData.fullname ? (
              <h3>{profileData.fullname}</h3>
            ) : (
              <PendingFigure size={30} />
            )}
          </div>
        </div>
        <div className="flex">
          <ThemeSwitch />
          <button id="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
    </>
  );
};

export default memo(TopBar);
