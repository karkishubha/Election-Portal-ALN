import { useState } from "react";

interface CandidateAvatarProps {
  candidateId: number;
  candidateName: string;
  sizeClassName?: string;
}

const CandidateAvatar = ({
  candidateId,
  candidateName,
  sizeClassName = "h-10 w-10",
}: CandidateAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = `https://result.election.gov.np/Images/Candidate/${candidateId}.jpg`;

  return (
    <div className={`${sizeClassName} rounded-full overflow-hidden shrink-0 bg-secondary flex items-center justify-center`}>
      {!imageError ? (
        <img
          src={imageUrl}
          alt={candidateName}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold">
          {candidateName?.charAt(0) || "?"}
        </div>
      )}
    </div>
  );
};

export default CandidateAvatar;
