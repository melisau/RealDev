public record Ticket(long Id,string Title,string Status,int Version);
public record CreateTicket(string? Title);
public record UpdateTicket(string? Status,int Version);
