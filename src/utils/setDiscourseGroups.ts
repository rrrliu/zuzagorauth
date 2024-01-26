
export const setDiscourseGroups = async (ticketType: string | undefined) => {
  try {
    console.log("🚀 ~ setDiscourseGroups ~ ticketType:", ticketType)

    const isZuMontenegroAttendee = ticketType === "ZuzaluResident" || ticketType === "ZuzaluVisitor" || ticketType === "ZuzaluOrganizer";
    console.log("🚀 ~ setDiscourseGroups ~ isZuMontenegroAttendee:", isZuMontenegroAttendee)
    const isZuConnectAttendee = ticketType === "ZuConnectResident";
    console.log("🚀 ~ setDiscourseGroups ~ isZuConnectAttendee:", isZuConnectAttendee)
    const isVitaliaAttendee = ticketType === "VitaliaResident";
    console.log("🚀 ~ setDiscourseGroups ~ isVitaliaAttendee:", isVitaliaAttendee)
    
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
    
    const addGroups = attendeeGroups.join(', ');
    console.log("🚀 ~ setDiscourseGroups ~ addGroups:", addGroups)
    
    return addGroups;
  } catch (error) {
      console.error('There was an error with the validation:', error);
      return false;
  }
};

export default setDiscourseGroups;