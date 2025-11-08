public class Operation {
    private OperationType type; // INSERT, DELETE, FORMAT
    private int position;
    private String text; // null cho DELETE
    private Map<String, Object> attributes; // cho FORMAT
    private String authorId;
    private Long timestamp;
}