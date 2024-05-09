
export const setDiscourseGroups = (ticketType: string | undefined) => {
  try {

    const isZuMontenegroAttendee = ticketType === "ZuzaluResident" || ticketType === "ZuzaluVisitor" || ticketType === "ZuzaluOrganizer";
    const isZuConnectAttendee = ticketType === "ZuConnectResident";
    const isVitaliaAttendee = ticketType === "VitaliaResident";
    const isZuVillageAttendee = ticketType === "ZuVillage";
    
    let attendeeGroups = [];
    
    if (isZuMontenegroAttendee) {
      attendeeGroups.push("Zuzalu");
    }
    if (isZuConnectAttendee) {
      attendeeGroups.push("ZuConnect");
    }
    if (isVitaliaAttendee) {
      attendeeGroups.push("Vitalia");
    }
    if (isVitaliaAttendee) {
      attendeeGroups.push("Vitalia");
    }
    if (isZuVillageAttendee) {
      attendeeGroups.push("ZuVillage");
    }
    
    const addGroups = attendeeGroups.join(', ');
    
    return addGroups;
  } catch (error) {
      console.error('There was an error with the validation:', error);
      return false;
  }
};

export default setDiscourseGroups;