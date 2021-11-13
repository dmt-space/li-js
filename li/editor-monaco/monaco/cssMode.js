import { e as editor, R as Range$1, l as languages, a as MarkerSeverity, U as Uri } from "./index.js";
var STOP_WHEN_IDLE_FOR = 2 * 60 * 1e3;
var WorkerManager = function() {
  function WorkerManager2(defaults) {
    var _this = this;
    this._defaults = defaults;
    this._worker = null;
    this._idleCheckInterval = window.setInterval(function() {
      return _this._checkIfIdle();
    }, 30 * 1e3);
    this._lastUsedTime = 0;
    this._configChangeListener = this._defaults.onDidChange(function() {
      return _this._stopWorker();
    });
  }
  WorkerManager2.prototype._stopWorker = function() {
    if (this._worker) {
      this._worker.dispose();
      this._worker = null;
    }
    this._client = null;
  };
  WorkerManager2.prototype.dispose = function() {
    clearInterval(this._idleCheckInterval);
    this._configChangeListener.dispose();
    this._stopWorker();
  };
  WorkerManager2.prototype._checkIfIdle = function() {
    if (!this._worker) {
      return;
    }
    var timePassedSinceLastUsed = Date.now() - this._lastUsedTime;
    if (timePassedSinceLastUsed > STOP_WHEN_IDLE_FOR) {
      this._stopWorker();
    }
  };
  WorkerManager2.prototype._getClient = function() {
    this._lastUsedTime = Date.now();
    if (!this._client) {
      this._worker = editor.createWebWorker({
        moduleId: "vs/language/css/cssWorker",
        label: this._defaults.languageId,
        createData: {
          options: this._defaults.options,
          languageId: this._defaults.languageId
        }
      });
      this._client = this._worker.getProxy();
    }
    return this._client;
  };
  WorkerManager2.prototype.getLanguageServiceWorker = function() {
    var _this = this;
    var resources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      resources[_i] = arguments[_i];
    }
    var _client;
    return this._getClient().then(function(client) {
      _client = client;
    }).then(function(_) {
      return _this._worker.withSyncedResources(resources);
    }).then(function(_) {
      return _client;
    });
  };
  return WorkerManager2;
}();
var integer;
(function(integer2) {
  integer2.MIN_VALUE = -2147483648;
  integer2.MAX_VALUE = 2147483647;
})(integer || (integer = {}));
var uinteger;
(function(uinteger2) {
  uinteger2.MIN_VALUE = 0;
  uinteger2.MAX_VALUE = 2147483647;
})(uinteger || (uinteger = {}));
var Position;
(function(Position2) {
  function create(line, character) {
    if (line === Number.MAX_VALUE) {
      line = uinteger.MAX_VALUE;
    }
    if (character === Number.MAX_VALUE) {
      character = uinteger.MAX_VALUE;
    }
    return { line, character };
  }
  Position2.create = create;
  function is(value) {
    var candidate = value;
    return Is.objectLiteral(candidate) && Is.uinteger(candidate.line) && Is.uinteger(candidate.character);
  }
  Position2.is = is;
})(Position || (Position = {}));
var Range;
(function(Range2) {
  function create(one, two, three, four) {
    if (Is.uinteger(one) && Is.uinteger(two) && Is.uinteger(three) && Is.uinteger(four)) {
      return { start: Position.create(one, two), end: Position.create(three, four) };
    } else if (Position.is(one) && Position.is(two)) {
      return { start: one, end: two };
    } else {
      throw new Error("Range#create called with invalid arguments[" + one + ", " + two + ", " + three + ", " + four + "]");
    }
  }
  Range2.create = create;
  function is(value) {
    var candidate = value;
    return Is.objectLiteral(candidate) && Position.is(candidate.start) && Position.is(candidate.end);
  }
  Range2.is = is;
})(Range || (Range = {}));
var Location;
(function(Location2) {
  function create(uri, range) {
    return { uri, range };
  }
  Location2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Range.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
  }
  Location2.is = is;
})(Location || (Location = {}));
var LocationLink;
(function(LocationLink2) {
  function create(targetUri, targetRange, targetSelectionRange, originSelectionRange) {
    return { targetUri, targetRange, targetSelectionRange, originSelectionRange };
  }
  LocationLink2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Range.is(candidate.targetRange) && Is.string(candidate.targetUri) && (Range.is(candidate.targetSelectionRange) || Is.undefined(candidate.targetSelectionRange)) && (Range.is(candidate.originSelectionRange) || Is.undefined(candidate.originSelectionRange));
  }
  LocationLink2.is = is;
})(LocationLink || (LocationLink = {}));
var Color;
(function(Color2) {
  function create(red, green, blue, alpha) {
    return {
      red,
      green,
      blue,
      alpha
    };
  }
  Color2.create = create;
  function is(value) {
    var candidate = value;
    return Is.numberRange(candidate.red, 0, 1) && Is.numberRange(candidate.green, 0, 1) && Is.numberRange(candidate.blue, 0, 1) && Is.numberRange(candidate.alpha, 0, 1);
  }
  Color2.is = is;
})(Color || (Color = {}));
var ColorInformation;
(function(ColorInformation2) {
  function create(range, color) {
    return {
      range,
      color
    };
  }
  ColorInformation2.create = create;
  function is(value) {
    var candidate = value;
    return Range.is(candidate.range) && Color.is(candidate.color);
  }
  ColorInformation2.is = is;
})(ColorInformation || (ColorInformation = {}));
var ColorPresentation;
(function(ColorPresentation2) {
  function create(label, textEdit, additionalTextEdits) {
    return {
      label,
      textEdit,
      additionalTextEdits
    };
  }
  ColorPresentation2.create = create;
  function is(value) {
    var candidate = value;
    return Is.string(candidate.label) && (Is.undefined(candidate.textEdit) || TextEdit.is(candidate)) && (Is.undefined(candidate.additionalTextEdits) || Is.typedArray(candidate.additionalTextEdits, TextEdit.is));
  }
  ColorPresentation2.is = is;
})(ColorPresentation || (ColorPresentation = {}));
var FoldingRangeKind;
(function(FoldingRangeKind2) {
  FoldingRangeKind2["Comment"] = "comment";
  FoldingRangeKind2["Imports"] = "imports";
  FoldingRangeKind2["Region"] = "region";
})(FoldingRangeKind || (FoldingRangeKind = {}));
var FoldingRange;
(function(FoldingRange2) {
  function create(startLine, endLine, startCharacter, endCharacter, kind) {
    var result = {
      startLine,
      endLine
    };
    if (Is.defined(startCharacter)) {
      result.startCharacter = startCharacter;
    }
    if (Is.defined(endCharacter)) {
      result.endCharacter = endCharacter;
    }
    if (Is.defined(kind)) {
      result.kind = kind;
    }
    return result;
  }
  FoldingRange2.create = create;
  function is(value) {
    var candidate = value;
    return Is.uinteger(candidate.startLine) && Is.uinteger(candidate.startLine) && (Is.undefined(candidate.startCharacter) || Is.uinteger(candidate.startCharacter)) && (Is.undefined(candidate.endCharacter) || Is.uinteger(candidate.endCharacter)) && (Is.undefined(candidate.kind) || Is.string(candidate.kind));
  }
  FoldingRange2.is = is;
})(FoldingRange || (FoldingRange = {}));
var DiagnosticRelatedInformation;
(function(DiagnosticRelatedInformation2) {
  function create(location, message) {
    return {
      location,
      message
    };
  }
  DiagnosticRelatedInformation2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Location.is(candidate.location) && Is.string(candidate.message);
  }
  DiagnosticRelatedInformation2.is = is;
})(DiagnosticRelatedInformation || (DiagnosticRelatedInformation = {}));
var DiagnosticSeverity;
(function(DiagnosticSeverity2) {
  DiagnosticSeverity2.Error = 1;
  DiagnosticSeverity2.Warning = 2;
  DiagnosticSeverity2.Information = 3;
  DiagnosticSeverity2.Hint = 4;
})(DiagnosticSeverity || (DiagnosticSeverity = {}));
var DiagnosticTag;
(function(DiagnosticTag2) {
  DiagnosticTag2.Unnecessary = 1;
  DiagnosticTag2.Deprecated = 2;
})(DiagnosticTag || (DiagnosticTag = {}));
var CodeDescription;
(function(CodeDescription2) {
  function is(value) {
    var candidate = value;
    return candidate !== void 0 && candidate !== null && Is.string(candidate.href);
  }
  CodeDescription2.is = is;
})(CodeDescription || (CodeDescription = {}));
var Diagnostic;
(function(Diagnostic2) {
  function create(range, message, severity, code, source, relatedInformation) {
    var result = { range, message };
    if (Is.defined(severity)) {
      result.severity = severity;
    }
    if (Is.defined(code)) {
      result.code = code;
    }
    if (Is.defined(source)) {
      result.source = source;
    }
    if (Is.defined(relatedInformation)) {
      result.relatedInformation = relatedInformation;
    }
    return result;
  }
  Diagnostic2.create = create;
  function is(value) {
    var _a;
    var candidate = value;
    return Is.defined(candidate) && Range.is(candidate.range) && Is.string(candidate.message) && (Is.number(candidate.severity) || Is.undefined(candidate.severity)) && (Is.integer(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code)) && (Is.undefined(candidate.codeDescription) || Is.string((_a = candidate.codeDescription) === null || _a === void 0 ? void 0 : _a.href)) && (Is.string(candidate.source) || Is.undefined(candidate.source)) && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
  }
  Diagnostic2.is = is;
})(Diagnostic || (Diagnostic = {}));
var Command;
(function(Command2) {
  function create(title, command) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    var result = { title, command };
    if (Is.defined(args) && args.length > 0) {
      result.arguments = args;
    }
    return result;
  }
  Command2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.string(candidate.title) && Is.string(candidate.command);
  }
  Command2.is = is;
})(Command || (Command = {}));
var TextEdit;
(function(TextEdit2) {
  function replace(range, newText) {
    return { range, newText };
  }
  TextEdit2.replace = replace;
  function insert(position, newText) {
    return { range: { start: position, end: position }, newText };
  }
  TextEdit2.insert = insert;
  function del(range) {
    return { range, newText: "" };
  }
  TextEdit2.del = del;
  function is(value) {
    var candidate = value;
    return Is.objectLiteral(candidate) && Is.string(candidate.newText) && Range.is(candidate.range);
  }
  TextEdit2.is = is;
})(TextEdit || (TextEdit = {}));
var ChangeAnnotation;
(function(ChangeAnnotation2) {
  function create(label, needsConfirmation, description) {
    var result = { label };
    if (needsConfirmation !== void 0) {
      result.needsConfirmation = needsConfirmation;
    }
    if (description !== void 0) {
      result.description = description;
    }
    return result;
  }
  ChangeAnnotation2.create = create;
  function is(value) {
    var candidate = value;
    return candidate !== void 0 && Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.boolean(candidate.needsConfirmation) || candidate.needsConfirmation === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
  }
  ChangeAnnotation2.is = is;
})(ChangeAnnotation || (ChangeAnnotation = {}));
var ChangeAnnotationIdentifier;
(function(ChangeAnnotationIdentifier2) {
  function is(value) {
    var candidate = value;
    return typeof candidate === "string";
  }
  ChangeAnnotationIdentifier2.is = is;
})(ChangeAnnotationIdentifier || (ChangeAnnotationIdentifier = {}));
var AnnotatedTextEdit;
(function(AnnotatedTextEdit2) {
  function replace(range, newText, annotation) {
    return { range, newText, annotationId: annotation };
  }
  AnnotatedTextEdit2.replace = replace;
  function insert(position, newText, annotation) {
    return { range: { start: position, end: position }, newText, annotationId: annotation };
  }
  AnnotatedTextEdit2.insert = insert;
  function del(range, annotation) {
    return { range, newText: "", annotationId: annotation };
  }
  AnnotatedTextEdit2.del = del;
  function is(value) {
    var candidate = value;
    return TextEdit.is(candidate) && (ChangeAnnotation.is(candidate.annotationId) || ChangeAnnotationIdentifier.is(candidate.annotationId));
  }
  AnnotatedTextEdit2.is = is;
})(AnnotatedTextEdit || (AnnotatedTextEdit = {}));
var TextDocumentEdit;
(function(TextDocumentEdit2) {
  function create(textDocument, edits) {
    return { textDocument, edits };
  }
  TextDocumentEdit2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && OptionalVersionedTextDocumentIdentifier.is(candidate.textDocument) && Array.isArray(candidate.edits);
  }
  TextDocumentEdit2.is = is;
})(TextDocumentEdit || (TextDocumentEdit = {}));
var CreateFile;
(function(CreateFile2) {
  function create(uri, options, annotation) {
    var result = {
      kind: "create",
      uri
    };
    if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
      result.options = options;
    }
    if (annotation !== void 0) {
      result.annotationId = annotation;
    }
    return result;
  }
  CreateFile2.create = create;
  function is(value) {
    var candidate = value;
    return candidate && candidate.kind === "create" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
  }
  CreateFile2.is = is;
})(CreateFile || (CreateFile = {}));
var RenameFile;
(function(RenameFile2) {
  function create(oldUri, newUri, options, annotation) {
    var result = {
      kind: "rename",
      oldUri,
      newUri
    };
    if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
      result.options = options;
    }
    if (annotation !== void 0) {
      result.annotationId = annotation;
    }
    return result;
  }
  RenameFile2.create = create;
  function is(value) {
    var candidate = value;
    return candidate && candidate.kind === "rename" && Is.string(candidate.oldUri) && Is.string(candidate.newUri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
  }
  RenameFile2.is = is;
})(RenameFile || (RenameFile = {}));
var DeleteFile;
(function(DeleteFile2) {
  function create(uri, options, annotation) {
    var result = {
      kind: "delete",
      uri
    };
    if (options !== void 0 && (options.recursive !== void 0 || options.ignoreIfNotExists !== void 0)) {
      result.options = options;
    }
    if (annotation !== void 0) {
      result.annotationId = annotation;
    }
    return result;
  }
  DeleteFile2.create = create;
  function is(value) {
    var candidate = value;
    return candidate && candidate.kind === "delete" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.recursive === void 0 || Is.boolean(candidate.options.recursive)) && (candidate.options.ignoreIfNotExists === void 0 || Is.boolean(candidate.options.ignoreIfNotExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
  }
  DeleteFile2.is = is;
})(DeleteFile || (DeleteFile = {}));
var WorkspaceEdit;
(function(WorkspaceEdit2) {
  function is(value) {
    var candidate = value;
    return candidate && (candidate.changes !== void 0 || candidate.documentChanges !== void 0) && (candidate.documentChanges === void 0 || candidate.documentChanges.every(function(change) {
      if (Is.string(change.kind)) {
        return CreateFile.is(change) || RenameFile.is(change) || DeleteFile.is(change);
      } else {
        return TextDocumentEdit.is(change);
      }
    }));
  }
  WorkspaceEdit2.is = is;
})(WorkspaceEdit || (WorkspaceEdit = {}));
var TextEditChangeImpl = function() {
  function TextEditChangeImpl2(edits, changeAnnotations) {
    this.edits = edits;
    this.changeAnnotations = changeAnnotations;
  }
  TextEditChangeImpl2.prototype.insert = function(position, newText, annotation) {
    var edit;
    var id;
    if (annotation === void 0) {
      edit = TextEdit.insert(position, newText);
    } else if (ChangeAnnotationIdentifier.is(annotation)) {
      id = annotation;
      edit = AnnotatedTextEdit.insert(position, newText, annotation);
    } else {
      this.assertChangeAnnotations(this.changeAnnotations);
      id = this.changeAnnotations.manage(annotation);
      edit = AnnotatedTextEdit.insert(position, newText, id);
    }
    this.edits.push(edit);
    if (id !== void 0) {
      return id;
    }
  };
  TextEditChangeImpl2.prototype.replace = function(range, newText, annotation) {
    var edit;
    var id;
    if (annotation === void 0) {
      edit = TextEdit.replace(range, newText);
    } else if (ChangeAnnotationIdentifier.is(annotation)) {
      id = annotation;
      edit = AnnotatedTextEdit.replace(range, newText, annotation);
    } else {
      this.assertChangeAnnotations(this.changeAnnotations);
      id = this.changeAnnotations.manage(annotation);
      edit = AnnotatedTextEdit.replace(range, newText, id);
    }
    this.edits.push(edit);
    if (id !== void 0) {
      return id;
    }
  };
  TextEditChangeImpl2.prototype.delete = function(range, annotation) {
    var edit;
    var id;
    if (annotation === void 0) {
      edit = TextEdit.del(range);
    } else if (ChangeAnnotationIdentifier.is(annotation)) {
      id = annotation;
      edit = AnnotatedTextEdit.del(range, annotation);
    } else {
      this.assertChangeAnnotations(this.changeAnnotations);
      id = this.changeAnnotations.manage(annotation);
      edit = AnnotatedTextEdit.del(range, id);
    }
    this.edits.push(edit);
    if (id !== void 0) {
      return id;
    }
  };
  TextEditChangeImpl2.prototype.add = function(edit) {
    this.edits.push(edit);
  };
  TextEditChangeImpl2.prototype.all = function() {
    return this.edits;
  };
  TextEditChangeImpl2.prototype.clear = function() {
    this.edits.splice(0, this.edits.length);
  };
  TextEditChangeImpl2.prototype.assertChangeAnnotations = function(value) {
    if (value === void 0) {
      throw new Error("Text edit change is not configured to manage change annotations.");
    }
  };
  return TextEditChangeImpl2;
}();
var ChangeAnnotations = function() {
  function ChangeAnnotations2(annotations) {
    this._annotations = annotations === void 0 ? Object.create(null) : annotations;
    this._counter = 0;
    this._size = 0;
  }
  ChangeAnnotations2.prototype.all = function() {
    return this._annotations;
  };
  Object.defineProperty(ChangeAnnotations2.prototype, "size", {
    get: function() {
      return this._size;
    },
    enumerable: false,
    configurable: true
  });
  ChangeAnnotations2.prototype.manage = function(idOrAnnotation, annotation) {
    var id;
    if (ChangeAnnotationIdentifier.is(idOrAnnotation)) {
      id = idOrAnnotation;
    } else {
      id = this.nextId();
      annotation = idOrAnnotation;
    }
    if (this._annotations[id] !== void 0) {
      throw new Error("Id " + id + " is already in use.");
    }
    if (annotation === void 0) {
      throw new Error("No annotation provided for id " + id);
    }
    this._annotations[id] = annotation;
    this._size++;
    return id;
  };
  ChangeAnnotations2.prototype.nextId = function() {
    this._counter++;
    return this._counter.toString();
  };
  return ChangeAnnotations2;
}();
(function() {
  function WorkspaceChange(workspaceEdit) {
    var _this = this;
    this._textEditChanges = Object.create(null);
    if (workspaceEdit !== void 0) {
      this._workspaceEdit = workspaceEdit;
      if (workspaceEdit.documentChanges) {
        this._changeAnnotations = new ChangeAnnotations(workspaceEdit.changeAnnotations);
        workspaceEdit.changeAnnotations = this._changeAnnotations.all();
        workspaceEdit.documentChanges.forEach(function(change) {
          if (TextDocumentEdit.is(change)) {
            var textEditChange = new TextEditChangeImpl(change.edits, _this._changeAnnotations);
            _this._textEditChanges[change.textDocument.uri] = textEditChange;
          }
        });
      } else if (workspaceEdit.changes) {
        Object.keys(workspaceEdit.changes).forEach(function(key) {
          var textEditChange = new TextEditChangeImpl(workspaceEdit.changes[key]);
          _this._textEditChanges[key] = textEditChange;
        });
      }
    } else {
      this._workspaceEdit = {};
    }
  }
  Object.defineProperty(WorkspaceChange.prototype, "edit", {
    get: function() {
      this.initDocumentChanges();
      if (this._changeAnnotations !== void 0) {
        if (this._changeAnnotations.size === 0) {
          this._workspaceEdit.changeAnnotations = void 0;
        } else {
          this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
        }
      }
      return this._workspaceEdit;
    },
    enumerable: false,
    configurable: true
  });
  WorkspaceChange.prototype.getTextEditChange = function(key) {
    if (OptionalVersionedTextDocumentIdentifier.is(key)) {
      this.initDocumentChanges();
      if (this._workspaceEdit.documentChanges === void 0) {
        throw new Error("Workspace edit is not configured for document changes.");
      }
      var textDocument = { uri: key.uri, version: key.version };
      var result = this._textEditChanges[textDocument.uri];
      if (!result) {
        var edits = [];
        var textDocumentEdit = {
          textDocument,
          edits
        };
        this._workspaceEdit.documentChanges.push(textDocumentEdit);
        result = new TextEditChangeImpl(edits, this._changeAnnotations);
        this._textEditChanges[textDocument.uri] = result;
      }
      return result;
    } else {
      this.initChanges();
      if (this._workspaceEdit.changes === void 0) {
        throw new Error("Workspace edit is not configured for normal text edit changes.");
      }
      var result = this._textEditChanges[key];
      if (!result) {
        var edits = [];
        this._workspaceEdit.changes[key] = edits;
        result = new TextEditChangeImpl(edits);
        this._textEditChanges[key] = result;
      }
      return result;
    }
  };
  WorkspaceChange.prototype.initDocumentChanges = function() {
    if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
      this._changeAnnotations = new ChangeAnnotations();
      this._workspaceEdit.documentChanges = [];
      this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
    }
  };
  WorkspaceChange.prototype.initChanges = function() {
    if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
      this._workspaceEdit.changes = Object.create(null);
    }
  };
  WorkspaceChange.prototype.createFile = function(uri, optionsOrAnnotation, options) {
    this.initDocumentChanges();
    if (this._workspaceEdit.documentChanges === void 0) {
      throw new Error("Workspace edit is not configured for document changes.");
    }
    var annotation;
    if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
      annotation = optionsOrAnnotation;
    } else {
      options = optionsOrAnnotation;
    }
    var operation;
    var id;
    if (annotation === void 0) {
      operation = CreateFile.create(uri, options);
    } else {
      id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
      operation = CreateFile.create(uri, options, id);
    }
    this._workspaceEdit.documentChanges.push(operation);
    if (id !== void 0) {
      return id;
    }
  };
  WorkspaceChange.prototype.renameFile = function(oldUri, newUri, optionsOrAnnotation, options) {
    this.initDocumentChanges();
    if (this._workspaceEdit.documentChanges === void 0) {
      throw new Error("Workspace edit is not configured for document changes.");
    }
    var annotation;
    if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
      annotation = optionsOrAnnotation;
    } else {
      options = optionsOrAnnotation;
    }
    var operation;
    var id;
    if (annotation === void 0) {
      operation = RenameFile.create(oldUri, newUri, options);
    } else {
      id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
      operation = RenameFile.create(oldUri, newUri, options, id);
    }
    this._workspaceEdit.documentChanges.push(operation);
    if (id !== void 0) {
      return id;
    }
  };
  WorkspaceChange.prototype.deleteFile = function(uri, optionsOrAnnotation, options) {
    this.initDocumentChanges();
    if (this._workspaceEdit.documentChanges === void 0) {
      throw new Error("Workspace edit is not configured for document changes.");
    }
    var annotation;
    if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
      annotation = optionsOrAnnotation;
    } else {
      options = optionsOrAnnotation;
    }
    var operation;
    var id;
    if (annotation === void 0) {
      operation = DeleteFile.create(uri, options);
    } else {
      id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
      operation = DeleteFile.create(uri, options, id);
    }
    this._workspaceEdit.documentChanges.push(operation);
    if (id !== void 0) {
      return id;
    }
  };
  return WorkspaceChange;
})();
var TextDocumentIdentifier;
(function(TextDocumentIdentifier2) {
  function create(uri) {
    return { uri };
  }
  TextDocumentIdentifier2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri);
  }
  TextDocumentIdentifier2.is = is;
})(TextDocumentIdentifier || (TextDocumentIdentifier = {}));
var VersionedTextDocumentIdentifier;
(function(VersionedTextDocumentIdentifier2) {
  function create(uri, version) {
    return { uri, version };
  }
  VersionedTextDocumentIdentifier2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri) && Is.integer(candidate.version);
  }
  VersionedTextDocumentIdentifier2.is = is;
})(VersionedTextDocumentIdentifier || (VersionedTextDocumentIdentifier = {}));
var OptionalVersionedTextDocumentIdentifier;
(function(OptionalVersionedTextDocumentIdentifier2) {
  function create(uri, version) {
    return { uri, version };
  }
  OptionalVersionedTextDocumentIdentifier2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri) && (candidate.version === null || Is.integer(candidate.version));
  }
  OptionalVersionedTextDocumentIdentifier2.is = is;
})(OptionalVersionedTextDocumentIdentifier || (OptionalVersionedTextDocumentIdentifier = {}));
var TextDocumentItem;
(function(TextDocumentItem2) {
  function create(uri, languageId, version, text) {
    return { uri, languageId, version, text };
  }
  TextDocumentItem2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.integer(candidate.version) && Is.string(candidate.text);
  }
  TextDocumentItem2.is = is;
})(TextDocumentItem || (TextDocumentItem = {}));
var MarkupKind;
(function(MarkupKind2) {
  MarkupKind2.PlainText = "plaintext";
  MarkupKind2.Markdown = "markdown";
})(MarkupKind || (MarkupKind = {}));
(function(MarkupKind2) {
  function is(value) {
    var candidate = value;
    return candidate === MarkupKind2.PlainText || candidate === MarkupKind2.Markdown;
  }
  MarkupKind2.is = is;
})(MarkupKind || (MarkupKind = {}));
var MarkupContent;
(function(MarkupContent2) {
  function is(value) {
    var candidate = value;
    return Is.objectLiteral(value) && MarkupKind.is(candidate.kind) && Is.string(candidate.value);
  }
  MarkupContent2.is = is;
})(MarkupContent || (MarkupContent = {}));
var CompletionItemKind;
(function(CompletionItemKind2) {
  CompletionItemKind2.Text = 1;
  CompletionItemKind2.Method = 2;
  CompletionItemKind2.Function = 3;
  CompletionItemKind2.Constructor = 4;
  CompletionItemKind2.Field = 5;
  CompletionItemKind2.Variable = 6;
  CompletionItemKind2.Class = 7;
  CompletionItemKind2.Interface = 8;
  CompletionItemKind2.Module = 9;
  CompletionItemKind2.Property = 10;
  CompletionItemKind2.Unit = 11;
  CompletionItemKind2.Value = 12;
  CompletionItemKind2.Enum = 13;
  CompletionItemKind2.Keyword = 14;
  CompletionItemKind2.Snippet = 15;
  CompletionItemKind2.Color = 16;
  CompletionItemKind2.File = 17;
  CompletionItemKind2.Reference = 18;
  CompletionItemKind2.Folder = 19;
  CompletionItemKind2.EnumMember = 20;
  CompletionItemKind2.Constant = 21;
  CompletionItemKind2.Struct = 22;
  CompletionItemKind2.Event = 23;
  CompletionItemKind2.Operator = 24;
  CompletionItemKind2.TypeParameter = 25;
})(CompletionItemKind || (CompletionItemKind = {}));
var InsertTextFormat;
(function(InsertTextFormat2) {
  InsertTextFormat2.PlainText = 1;
  InsertTextFormat2.Snippet = 2;
})(InsertTextFormat || (InsertTextFormat = {}));
var CompletionItemTag;
(function(CompletionItemTag2) {
  CompletionItemTag2.Deprecated = 1;
})(CompletionItemTag || (CompletionItemTag = {}));
var InsertReplaceEdit;
(function(InsertReplaceEdit2) {
  function create(newText, insert, replace) {
    return { newText, insert, replace };
  }
  InsertReplaceEdit2.create = create;
  function is(value) {
    var candidate = value;
    return candidate && Is.string(candidate.newText) && Range.is(candidate.insert) && Range.is(candidate.replace);
  }
  InsertReplaceEdit2.is = is;
})(InsertReplaceEdit || (InsertReplaceEdit = {}));
var InsertTextMode;
(function(InsertTextMode2) {
  InsertTextMode2.asIs = 1;
  InsertTextMode2.adjustIndentation = 2;
})(InsertTextMode || (InsertTextMode = {}));
var CompletionItem;
(function(CompletionItem2) {
  function create(label) {
    return { label };
  }
  CompletionItem2.create = create;
})(CompletionItem || (CompletionItem = {}));
var CompletionList;
(function(CompletionList2) {
  function create(items, isIncomplete) {
    return { items: items ? items : [], isIncomplete: !!isIncomplete };
  }
  CompletionList2.create = create;
})(CompletionList || (CompletionList = {}));
var MarkedString;
(function(MarkedString2) {
  function fromPlainText(plainText) {
    return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
  }
  MarkedString2.fromPlainText = fromPlainText;
  function is(value) {
    var candidate = value;
    return Is.string(candidate) || Is.objectLiteral(candidate) && Is.string(candidate.language) && Is.string(candidate.value);
  }
  MarkedString2.is = is;
})(MarkedString || (MarkedString = {}));
var Hover;
(function(Hover2) {
  function is(value) {
    var candidate = value;
    return !!candidate && Is.objectLiteral(candidate) && (MarkupContent.is(candidate.contents) || MarkedString.is(candidate.contents) || Is.typedArray(candidate.contents, MarkedString.is)) && (value.range === void 0 || Range.is(value.range));
  }
  Hover2.is = is;
})(Hover || (Hover = {}));
var ParameterInformation;
(function(ParameterInformation2) {
  function create(label, documentation) {
    return documentation ? { label, documentation } : { label };
  }
  ParameterInformation2.create = create;
})(ParameterInformation || (ParameterInformation = {}));
var SignatureInformation;
(function(SignatureInformation2) {
  function create(label, documentation) {
    var parameters = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      parameters[_i - 2] = arguments[_i];
    }
    var result = { label };
    if (Is.defined(documentation)) {
      result.documentation = documentation;
    }
    if (Is.defined(parameters)) {
      result.parameters = parameters;
    } else {
      result.parameters = [];
    }
    return result;
  }
  SignatureInformation2.create = create;
})(SignatureInformation || (SignatureInformation = {}));
var DocumentHighlightKind;
(function(DocumentHighlightKind2) {
  DocumentHighlightKind2.Text = 1;
  DocumentHighlightKind2.Read = 2;
  DocumentHighlightKind2.Write = 3;
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
var DocumentHighlight;
(function(DocumentHighlight2) {
  function create(range, kind) {
    var result = { range };
    if (Is.number(kind)) {
      result.kind = kind;
    }
    return result;
  }
  DocumentHighlight2.create = create;
})(DocumentHighlight || (DocumentHighlight = {}));
var SymbolKind;
(function(SymbolKind2) {
  SymbolKind2.File = 1;
  SymbolKind2.Module = 2;
  SymbolKind2.Namespace = 3;
  SymbolKind2.Package = 4;
  SymbolKind2.Class = 5;
  SymbolKind2.Method = 6;
  SymbolKind2.Property = 7;
  SymbolKind2.Field = 8;
  SymbolKind2.Constructor = 9;
  SymbolKind2.Enum = 10;
  SymbolKind2.Interface = 11;
  SymbolKind2.Function = 12;
  SymbolKind2.Variable = 13;
  SymbolKind2.Constant = 14;
  SymbolKind2.String = 15;
  SymbolKind2.Number = 16;
  SymbolKind2.Boolean = 17;
  SymbolKind2.Array = 18;
  SymbolKind2.Object = 19;
  SymbolKind2.Key = 20;
  SymbolKind2.Null = 21;
  SymbolKind2.EnumMember = 22;
  SymbolKind2.Struct = 23;
  SymbolKind2.Event = 24;
  SymbolKind2.Operator = 25;
  SymbolKind2.TypeParameter = 26;
})(SymbolKind || (SymbolKind = {}));
var SymbolTag;
(function(SymbolTag2) {
  SymbolTag2.Deprecated = 1;
})(SymbolTag || (SymbolTag = {}));
var SymbolInformation;
(function(SymbolInformation2) {
  function create(name, kind, range, uri, containerName) {
    var result = {
      name,
      kind,
      location: { uri, range }
    };
    if (containerName) {
      result.containerName = containerName;
    }
    return result;
  }
  SymbolInformation2.create = create;
})(SymbolInformation || (SymbolInformation = {}));
var DocumentSymbol;
(function(DocumentSymbol2) {
  function create(name, detail, kind, range, selectionRange, children) {
    var result = {
      name,
      detail,
      kind,
      range,
      selectionRange
    };
    if (children !== void 0) {
      result.children = children;
    }
    return result;
  }
  DocumentSymbol2.create = create;
  function is(value) {
    var candidate = value;
    return candidate && Is.string(candidate.name) && Is.number(candidate.kind) && Range.is(candidate.range) && Range.is(candidate.selectionRange) && (candidate.detail === void 0 || Is.string(candidate.detail)) && (candidate.deprecated === void 0 || Is.boolean(candidate.deprecated)) && (candidate.children === void 0 || Array.isArray(candidate.children)) && (candidate.tags === void 0 || Array.isArray(candidate.tags));
  }
  DocumentSymbol2.is = is;
})(DocumentSymbol || (DocumentSymbol = {}));
var CodeActionKind;
(function(CodeActionKind2) {
  CodeActionKind2.Empty = "";
  CodeActionKind2.QuickFix = "quickfix";
  CodeActionKind2.Refactor = "refactor";
  CodeActionKind2.RefactorExtract = "refactor.extract";
  CodeActionKind2.RefactorInline = "refactor.inline";
  CodeActionKind2.RefactorRewrite = "refactor.rewrite";
  CodeActionKind2.Source = "source";
  CodeActionKind2.SourceOrganizeImports = "source.organizeImports";
  CodeActionKind2.SourceFixAll = "source.fixAll";
})(CodeActionKind || (CodeActionKind = {}));
var CodeActionContext;
(function(CodeActionContext2) {
  function create(diagnostics, only) {
    var result = { diagnostics };
    if (only !== void 0 && only !== null) {
      result.only = only;
    }
    return result;
  }
  CodeActionContext2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic.is) && (candidate.only === void 0 || Is.typedArray(candidate.only, Is.string));
  }
  CodeActionContext2.is = is;
})(CodeActionContext || (CodeActionContext = {}));
var CodeAction;
(function(CodeAction2) {
  function create(title, kindOrCommandOrEdit, kind) {
    var result = { title };
    var checkKind = true;
    if (typeof kindOrCommandOrEdit === "string") {
      checkKind = false;
      result.kind = kindOrCommandOrEdit;
    } else if (Command.is(kindOrCommandOrEdit)) {
      result.command = kindOrCommandOrEdit;
    } else {
      result.edit = kindOrCommandOrEdit;
    }
    if (checkKind && kind !== void 0) {
      result.kind = kind;
    }
    return result;
  }
  CodeAction2.create = create;
  function is(value) {
    var candidate = value;
    return candidate && Is.string(candidate.title) && (candidate.diagnostics === void 0 || Is.typedArray(candidate.diagnostics, Diagnostic.is)) && (candidate.kind === void 0 || Is.string(candidate.kind)) && (candidate.edit !== void 0 || candidate.command !== void 0) && (candidate.command === void 0 || Command.is(candidate.command)) && (candidate.isPreferred === void 0 || Is.boolean(candidate.isPreferred)) && (candidate.edit === void 0 || WorkspaceEdit.is(candidate.edit));
  }
  CodeAction2.is = is;
})(CodeAction || (CodeAction = {}));
var CodeLens;
(function(CodeLens2) {
  function create(range, data) {
    var result = { range };
    if (Is.defined(data)) {
      result.data = data;
    }
    return result;
  }
  CodeLens2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
  }
  CodeLens2.is = is;
})(CodeLens || (CodeLens = {}));
var FormattingOptions;
(function(FormattingOptions2) {
  function create(tabSize, insertSpaces) {
    return { tabSize, insertSpaces };
  }
  FormattingOptions2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.uinteger(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
  }
  FormattingOptions2.is = is;
})(FormattingOptions || (FormattingOptions = {}));
var DocumentLink;
(function(DocumentLink2) {
  function create(range, target, data) {
    return { range, target, data };
  }
  DocumentLink2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
  }
  DocumentLink2.is = is;
})(DocumentLink || (DocumentLink = {}));
var SelectionRange;
(function(SelectionRange2) {
  function create(range, parent) {
    return { range, parent };
  }
  SelectionRange2.create = create;
  function is(value) {
    var candidate = value;
    return candidate !== void 0 && Range.is(candidate.range) && (candidate.parent === void 0 || SelectionRange2.is(candidate.parent));
  }
  SelectionRange2.is = is;
})(SelectionRange || (SelectionRange = {}));
var TextDocument;
(function(TextDocument2) {
  function create(uri, languageId, version, content) {
    return new FullTextDocument(uri, languageId, version, content);
  }
  TextDocument2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.uinteger(candidate.lineCount) && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
  }
  TextDocument2.is = is;
  function applyEdits(document, edits) {
    var text = document.getText();
    var sortedEdits = mergeSort(edits, function(a, b) {
      var diff = a.range.start.line - b.range.start.line;
      if (diff === 0) {
        return a.range.start.character - b.range.start.character;
      }
      return diff;
    });
    var lastModifiedOffset = text.length;
    for (var i = sortedEdits.length - 1; i >= 0; i--) {
      var e = sortedEdits[i];
      var startOffset = document.offsetAt(e.range.start);
      var endOffset = document.offsetAt(e.range.end);
      if (endOffset <= lastModifiedOffset) {
        text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
      } else {
        throw new Error("Overlapping edit");
      }
      lastModifiedOffset = startOffset;
    }
    return text;
  }
  TextDocument2.applyEdits = applyEdits;
  function mergeSort(data, compare) {
    if (data.length <= 1) {
      return data;
    }
    var p = data.length / 2 | 0;
    var left = data.slice(0, p);
    var right = data.slice(p);
    mergeSort(left, compare);
    mergeSort(right, compare);
    var leftIdx = 0;
    var rightIdx = 0;
    var i = 0;
    while (leftIdx < left.length && rightIdx < right.length) {
      var ret = compare(left[leftIdx], right[rightIdx]);
      if (ret <= 0) {
        data[i++] = left[leftIdx++];
      } else {
        data[i++] = right[rightIdx++];
      }
    }
    while (leftIdx < left.length) {
      data[i++] = left[leftIdx++];
    }
    while (rightIdx < right.length) {
      data[i++] = right[rightIdx++];
    }
    return data;
  }
})(TextDocument || (TextDocument = {}));
var FullTextDocument = function() {
  function FullTextDocument2(uri, languageId, version, content) {
    this._uri = uri;
    this._languageId = languageId;
    this._version = version;
    this._content = content;
    this._lineOffsets = void 0;
  }
  Object.defineProperty(FullTextDocument2.prototype, "uri", {
    get: function() {
      return this._uri;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(FullTextDocument2.prototype, "languageId", {
    get: function() {
      return this._languageId;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(FullTextDocument2.prototype, "version", {
    get: function() {
      return this._version;
    },
    enumerable: false,
    configurable: true
  });
  FullTextDocument2.prototype.getText = function(range) {
    if (range) {
      var start = this.offsetAt(range.start);
      var end = this.offsetAt(range.end);
      return this._content.substring(start, end);
    }
    return this._content;
  };
  FullTextDocument2.prototype.update = function(event, version) {
    this._content = event.text;
    this._version = version;
    this._lineOffsets = void 0;
  };
  FullTextDocument2.prototype.getLineOffsets = function() {
    if (this._lineOffsets === void 0) {
      var lineOffsets = [];
      var text = this._content;
      var isLineStart = true;
      for (var i = 0; i < text.length; i++) {
        if (isLineStart) {
          lineOffsets.push(i);
          isLineStart = false;
        }
        var ch = text.charAt(i);
        isLineStart = ch === "\r" || ch === "\n";
        if (ch === "\r" && i + 1 < text.length && text.charAt(i + 1) === "\n") {
          i++;
        }
      }
      if (isLineStart && text.length > 0) {
        lineOffsets.push(text.length);
      }
      this._lineOffsets = lineOffsets;
    }
    return this._lineOffsets;
  };
  FullTextDocument2.prototype.positionAt = function(offset) {
    offset = Math.max(Math.min(offset, this._content.length), 0);
    var lineOffsets = this.getLineOffsets();
    var low = 0, high = lineOffsets.length;
    if (high === 0) {
      return Position.create(0, offset);
    }
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    var line = low - 1;
    return Position.create(line, offset - lineOffsets[line]);
  };
  FullTextDocument2.prototype.offsetAt = function(position) {
    var lineOffsets = this.getLineOffsets();
    if (position.line >= lineOffsets.length) {
      return this._content.length;
    } else if (position.line < 0) {
      return 0;
    }
    var lineOffset = lineOffsets[position.line];
    var nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
    return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
  };
  Object.defineProperty(FullTextDocument2.prototype, "lineCount", {
    get: function() {
      return this.getLineOffsets().length;
    },
    enumerable: false,
    configurable: true
  });
  return FullTextDocument2;
}();
var Is;
(function(Is2) {
  var toString = Object.prototype.toString;
  function defined(value) {
    return typeof value !== "undefined";
  }
  Is2.defined = defined;
  function undefined$1(value) {
    return typeof value === "undefined";
  }
  Is2.undefined = undefined$1;
  function boolean(value) {
    return value === true || value === false;
  }
  Is2.boolean = boolean;
  function string(value) {
    return toString.call(value) === "[object String]";
  }
  Is2.string = string;
  function number(value) {
    return toString.call(value) === "[object Number]";
  }
  Is2.number = number;
  function numberRange(value, min, max) {
    return toString.call(value) === "[object Number]" && min <= value && value <= max;
  }
  Is2.numberRange = numberRange;
  function integer2(value) {
    return toString.call(value) === "[object Number]" && -2147483648 <= value && value <= 2147483647;
  }
  Is2.integer = integer2;
  function uinteger2(value) {
    return toString.call(value) === "[object Number]" && 0 <= value && value <= 2147483647;
  }
  Is2.uinteger = uinteger2;
  function func(value) {
    return toString.call(value) === "[object Function]";
  }
  Is2.func = func;
  function objectLiteral(value) {
    return value !== null && typeof value === "object";
  }
  Is2.objectLiteral = objectLiteral;
  function typedArray(value, check) {
    return Array.isArray(value) && value.every(check);
  }
  Is2.typedArray = typedArray;
})(Is || (Is = {}));
var DiagnosticsAdapter = function() {
  function DiagnosticsAdapter2(_languageId, _worker, defaults) {
    var _this = this;
    this._languageId = _languageId;
    this._worker = _worker;
    this._disposables = [];
    this._listener = Object.create(null);
    var onModelAdd = function(model) {
      var modeId = model.getLanguageId();
      if (modeId !== _this._languageId) {
        return;
      }
      var handle;
      _this._listener[model.uri.toString()] = model.onDidChangeContent(function() {
        window.clearTimeout(handle);
        handle = window.setTimeout(function() {
          return _this._doValidate(model.uri, modeId);
        }, 500);
      });
      _this._doValidate(model.uri, modeId);
    };
    var onModelRemoved = function(model) {
      editor.setModelMarkers(model, _this._languageId, []);
      var uriStr = model.uri.toString();
      var listener = _this._listener[uriStr];
      if (listener) {
        listener.dispose();
        delete _this._listener[uriStr];
      }
    };
    this._disposables.push(editor.onDidCreateModel(onModelAdd));
    this._disposables.push(editor.onWillDisposeModel(onModelRemoved));
    this._disposables.push(editor.onDidChangeModelLanguage(function(event) {
      onModelRemoved(event.model);
      onModelAdd(event.model);
    }));
    defaults.onDidChange(function(_) {
      editor.getModels().forEach(function(model) {
        if (model.getLanguageId() === _this._languageId) {
          onModelRemoved(model);
          onModelAdd(model);
        }
      });
    });
    this._disposables.push({
      dispose: function() {
        for (var key in _this._listener) {
          _this._listener[key].dispose();
        }
      }
    });
    editor.getModels().forEach(onModelAdd);
  }
  DiagnosticsAdapter2.prototype.dispose = function() {
    this._disposables.forEach(function(d) {
      return d && d.dispose();
    });
    this._disposables = [];
  };
  DiagnosticsAdapter2.prototype._doValidate = function(resource, languageId) {
    this._worker(resource).then(function(worker) {
      return worker.doValidation(resource.toString());
    }).then(function(diagnostics) {
      var markers = diagnostics.map(function(d) {
        return toDiagnostics(resource, d);
      });
      var model = editor.getModel(resource);
      if (model && model.getLanguageId() === languageId) {
        editor.setModelMarkers(model, languageId, markers);
      }
    }).then(void 0, function(err) {
      console.error(err);
    });
  };
  return DiagnosticsAdapter2;
}();
function toSeverity(lsSeverity) {
  switch (lsSeverity) {
    case DiagnosticSeverity.Error:
      return MarkerSeverity.Error;
    case DiagnosticSeverity.Warning:
      return MarkerSeverity.Warning;
    case DiagnosticSeverity.Information:
      return MarkerSeverity.Info;
    case DiagnosticSeverity.Hint:
      return MarkerSeverity.Hint;
    default:
      return MarkerSeverity.Info;
  }
}
function toDiagnostics(resource, diag) {
  var code = typeof diag.code === "number" ? String(diag.code) : diag.code;
  return {
    severity: toSeverity(diag.severity),
    startLineNumber: diag.range.start.line + 1,
    startColumn: diag.range.start.character + 1,
    endLineNumber: diag.range.end.line + 1,
    endColumn: diag.range.end.character + 1,
    message: diag.message,
    code,
    source: diag.source
  };
}
function fromPosition(position) {
  if (!position) {
    return void 0;
  }
  return { character: position.column - 1, line: position.lineNumber - 1 };
}
function fromRange(range) {
  if (!range) {
    return void 0;
  }
  return {
    start: {
      line: range.startLineNumber - 1,
      character: range.startColumn - 1
    },
    end: { line: range.endLineNumber - 1, character: range.endColumn - 1 }
  };
}
function toRange(range) {
  if (!range) {
    return void 0;
  }
  return new Range$1(range.start.line + 1, range.start.character + 1, range.end.line + 1, range.end.character + 1);
}
function isInsertReplaceEdit(edit) {
  return typeof edit.insert !== "undefined" && typeof edit.replace !== "undefined";
}
function toCompletionItemKind(kind) {
  var mItemKind = languages.CompletionItemKind;
  switch (kind) {
    case CompletionItemKind.Text:
      return mItemKind.Text;
    case CompletionItemKind.Method:
      return mItemKind.Method;
    case CompletionItemKind.Function:
      return mItemKind.Function;
    case CompletionItemKind.Constructor:
      return mItemKind.Constructor;
    case CompletionItemKind.Field:
      return mItemKind.Field;
    case CompletionItemKind.Variable:
      return mItemKind.Variable;
    case CompletionItemKind.Class:
      return mItemKind.Class;
    case CompletionItemKind.Interface:
      return mItemKind.Interface;
    case CompletionItemKind.Module:
      return mItemKind.Module;
    case CompletionItemKind.Property:
      return mItemKind.Property;
    case CompletionItemKind.Unit:
      return mItemKind.Unit;
    case CompletionItemKind.Value:
      return mItemKind.Value;
    case CompletionItemKind.Enum:
      return mItemKind.Enum;
    case CompletionItemKind.Keyword:
      return mItemKind.Keyword;
    case CompletionItemKind.Snippet:
      return mItemKind.Snippet;
    case CompletionItemKind.Color:
      return mItemKind.Color;
    case CompletionItemKind.File:
      return mItemKind.File;
    case CompletionItemKind.Reference:
      return mItemKind.Reference;
  }
  return mItemKind.Property;
}
function toTextEdit(textEdit) {
  if (!textEdit) {
    return void 0;
  }
  return {
    range: toRange(textEdit.range),
    text: textEdit.newText
  };
}
function toCommand(c) {
  return c && c.command === "editor.action.triggerSuggest" ? { id: c.command, title: c.title, arguments: c.arguments } : void 0;
}
var CompletionAdapter = function() {
  function CompletionAdapter2(_worker) {
    this._worker = _worker;
  }
  Object.defineProperty(CompletionAdapter2.prototype, "triggerCharacters", {
    get: function() {
      return ["/", "-", ":"];
    },
    enumerable: false,
    configurable: true
  });
  CompletionAdapter2.prototype.provideCompletionItems = function(model, position, context, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.doComplete(resource.toString(), fromPosition(position));
    }).then(function(info) {
      if (!info) {
        return;
      }
      var wordInfo = model.getWordUntilPosition(position);
      var wordRange = new Range$1(position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn);
      var items = info.items.map(function(entry) {
        var item = {
          label: entry.label,
          insertText: entry.insertText || entry.label,
          sortText: entry.sortText,
          filterText: entry.filterText,
          documentation: entry.documentation,
          detail: entry.detail,
          command: toCommand(entry.command),
          range: wordRange,
          kind: toCompletionItemKind(entry.kind)
        };
        if (entry.textEdit) {
          if (isInsertReplaceEdit(entry.textEdit)) {
            item.range = {
              insert: toRange(entry.textEdit.insert),
              replace: toRange(entry.textEdit.replace)
            };
          } else {
            item.range = toRange(entry.textEdit.range);
          }
          item.insertText = entry.textEdit.newText;
        }
        if (entry.additionalTextEdits) {
          item.additionalTextEdits = entry.additionalTextEdits.map(toTextEdit);
        }
        if (entry.insertTextFormat === InsertTextFormat.Snippet) {
          item.insertTextRules = languages.CompletionItemInsertTextRule.InsertAsSnippet;
        }
        return item;
      });
      return {
        isIncomplete: info.isIncomplete,
        suggestions: items
      };
    });
  };
  return CompletionAdapter2;
}();
function isMarkupContent(thing) {
  return thing && typeof thing === "object" && typeof thing.kind === "string";
}
function toMarkdownString(entry) {
  if (typeof entry === "string") {
    return {
      value: entry
    };
  }
  if (isMarkupContent(entry)) {
    if (entry.kind === "plaintext") {
      return {
        value: entry.value.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&")
      };
    }
    return {
      value: entry.value
    };
  }
  return { value: "```" + entry.language + "\n" + entry.value + "\n```\n" };
}
function toMarkedStringArray(contents) {
  if (!contents) {
    return void 0;
  }
  if (Array.isArray(contents)) {
    return contents.map(toMarkdownString);
  }
  return [toMarkdownString(contents)];
}
var HoverAdapter = function() {
  function HoverAdapter2(_worker) {
    this._worker = _worker;
  }
  HoverAdapter2.prototype.provideHover = function(model, position, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.doHover(resource.toString(), fromPosition(position));
    }).then(function(info) {
      if (!info) {
        return;
      }
      return {
        range: toRange(info.range),
        contents: toMarkedStringArray(info.contents)
      };
    });
  };
  return HoverAdapter2;
}();
function toDocumentHighlightKind(kind) {
  switch (kind) {
    case DocumentHighlightKind.Read:
      return languages.DocumentHighlightKind.Read;
    case DocumentHighlightKind.Write:
      return languages.DocumentHighlightKind.Write;
    case DocumentHighlightKind.Text:
      return languages.DocumentHighlightKind.Text;
  }
  return languages.DocumentHighlightKind.Text;
}
var DocumentHighlightAdapter = function() {
  function DocumentHighlightAdapter2(_worker) {
    this._worker = _worker;
  }
  DocumentHighlightAdapter2.prototype.provideDocumentHighlights = function(model, position, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.findDocumentHighlights(resource.toString(), fromPosition(position));
    }).then(function(entries) {
      if (!entries) {
        return;
      }
      return entries.map(function(entry) {
        return {
          range: toRange(entry.range),
          kind: toDocumentHighlightKind(entry.kind)
        };
      });
    });
  };
  return DocumentHighlightAdapter2;
}();
function toLocation(location) {
  return {
    uri: Uri.parse(location.uri),
    range: toRange(location.range)
  };
}
var DefinitionAdapter = function() {
  function DefinitionAdapter2(_worker) {
    this._worker = _worker;
  }
  DefinitionAdapter2.prototype.provideDefinition = function(model, position, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.findDefinition(resource.toString(), fromPosition(position));
    }).then(function(definition) {
      if (!definition) {
        return;
      }
      return [toLocation(definition)];
    });
  };
  return DefinitionAdapter2;
}();
var ReferenceAdapter = function() {
  function ReferenceAdapter2(_worker) {
    this._worker = _worker;
  }
  ReferenceAdapter2.prototype.provideReferences = function(model, position, context, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.findReferences(resource.toString(), fromPosition(position));
    }).then(function(entries) {
      if (!entries) {
        return;
      }
      return entries.map(toLocation);
    });
  };
  return ReferenceAdapter2;
}();
function toWorkspaceEdit(edit) {
  if (!edit || !edit.changes) {
    return void 0;
  }
  var resourceEdits = [];
  for (var uri in edit.changes) {
    var _uri = Uri.parse(uri);
    for (var _i = 0, _a = edit.changes[uri]; _i < _a.length; _i++) {
      var e = _a[_i];
      resourceEdits.push({
        resource: _uri,
        edit: {
          range: toRange(e.range),
          text: e.newText
        }
      });
    }
  }
  return {
    edits: resourceEdits
  };
}
var RenameAdapter = function() {
  function RenameAdapter2(_worker) {
    this._worker = _worker;
  }
  RenameAdapter2.prototype.provideRenameEdits = function(model, position, newName, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.doRename(resource.toString(), fromPosition(position), newName);
    }).then(function(edit) {
      return toWorkspaceEdit(edit);
    });
  };
  return RenameAdapter2;
}();
function toSymbolKind(kind) {
  var mKind = languages.SymbolKind;
  switch (kind) {
    case SymbolKind.File:
      return mKind.Array;
    case SymbolKind.Module:
      return mKind.Module;
    case SymbolKind.Namespace:
      return mKind.Namespace;
    case SymbolKind.Package:
      return mKind.Package;
    case SymbolKind.Class:
      return mKind.Class;
    case SymbolKind.Method:
      return mKind.Method;
    case SymbolKind.Property:
      return mKind.Property;
    case SymbolKind.Field:
      return mKind.Field;
    case SymbolKind.Constructor:
      return mKind.Constructor;
    case SymbolKind.Enum:
      return mKind.Enum;
    case SymbolKind.Interface:
      return mKind.Interface;
    case SymbolKind.Function:
      return mKind.Function;
    case SymbolKind.Variable:
      return mKind.Variable;
    case SymbolKind.Constant:
      return mKind.Constant;
    case SymbolKind.String:
      return mKind.String;
    case SymbolKind.Number:
      return mKind.Number;
    case SymbolKind.Boolean:
      return mKind.Boolean;
    case SymbolKind.Array:
      return mKind.Array;
  }
  return mKind.Function;
}
var DocumentSymbolAdapter = function() {
  function DocumentSymbolAdapter2(_worker) {
    this._worker = _worker;
  }
  DocumentSymbolAdapter2.prototype.provideDocumentSymbols = function(model, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.findDocumentSymbols(resource.toString());
    }).then(function(items) {
      if (!items) {
        return;
      }
      return items.map(function(item) {
        return {
          name: item.name,
          detail: "",
          containerName: item.containerName,
          kind: toSymbolKind(item.kind),
          tags: [],
          range: toRange(item.location.range),
          selectionRange: toRange(item.location.range)
        };
      });
    });
  };
  return DocumentSymbolAdapter2;
}();
var DocumentColorAdapter = function() {
  function DocumentColorAdapter2(_worker) {
    this._worker = _worker;
  }
  DocumentColorAdapter2.prototype.provideDocumentColors = function(model, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.findDocumentColors(resource.toString());
    }).then(function(infos) {
      if (!infos) {
        return;
      }
      return infos.map(function(item) {
        return {
          color: item.color,
          range: toRange(item.range)
        };
      });
    });
  };
  DocumentColorAdapter2.prototype.provideColorPresentations = function(model, info, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.getColorPresentations(resource.toString(), info.color, fromRange(info.range));
    }).then(function(presentations) {
      if (!presentations) {
        return;
      }
      return presentations.map(function(presentation) {
        var item = {
          label: presentation.label
        };
        if (presentation.textEdit) {
          item.textEdit = toTextEdit(presentation.textEdit);
        }
        if (presentation.additionalTextEdits) {
          item.additionalTextEdits = presentation.additionalTextEdits.map(toTextEdit);
        }
        return item;
      });
    });
  };
  return DocumentColorAdapter2;
}();
var FoldingRangeAdapter = function() {
  function FoldingRangeAdapter2(_worker) {
    this._worker = _worker;
  }
  FoldingRangeAdapter2.prototype.provideFoldingRanges = function(model, context, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.getFoldingRanges(resource.toString(), context);
    }).then(function(ranges) {
      if (!ranges) {
        return;
      }
      return ranges.map(function(range) {
        var result = {
          start: range.startLine + 1,
          end: range.endLine + 1
        };
        if (typeof range.kind !== "undefined") {
          result.kind = toFoldingRangeKind(range.kind);
        }
        return result;
      });
    });
  };
  return FoldingRangeAdapter2;
}();
function toFoldingRangeKind(kind) {
  switch (kind) {
    case FoldingRangeKind.Comment:
      return languages.FoldingRangeKind.Comment;
    case FoldingRangeKind.Imports:
      return languages.FoldingRangeKind.Imports;
    case FoldingRangeKind.Region:
      return languages.FoldingRangeKind.Region;
  }
}
var SelectionRangeAdapter = function() {
  function SelectionRangeAdapter2(_worker) {
    this._worker = _worker;
  }
  SelectionRangeAdapter2.prototype.provideSelectionRanges = function(model, positions, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.getSelectionRanges(resource.toString(), positions.map(fromPosition));
    }).then(function(selectionRanges) {
      if (!selectionRanges) {
        return;
      }
      return selectionRanges.map(function(selectionRange) {
        var result = [];
        while (selectionRange) {
          result.push({ range: toRange(selectionRange.range) });
          selectionRange = selectionRange.parent;
        }
        return result;
      });
    });
  };
  return SelectionRangeAdapter2;
}();
function setupMode(defaults) {
  var disposables = [];
  var providers = [];
  var client = new WorkerManager(defaults);
  disposables.push(client);
  var worker = function() {
    var uris = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      uris[_i] = arguments[_i];
    }
    return client.getLanguageServiceWorker.apply(client, uris);
  };
  function registerProviders() {
    var languageId = defaults.languageId, modeConfiguration = defaults.modeConfiguration;
    disposeAll(providers);
    if (modeConfiguration.completionItems) {
      providers.push(languages.registerCompletionItemProvider(languageId, new CompletionAdapter(worker)));
    }
    if (modeConfiguration.hovers) {
      providers.push(languages.registerHoverProvider(languageId, new HoverAdapter(worker)));
    }
    if (modeConfiguration.documentHighlights) {
      providers.push(languages.registerDocumentHighlightProvider(languageId, new DocumentHighlightAdapter(worker)));
    }
    if (modeConfiguration.definitions) {
      providers.push(languages.registerDefinitionProvider(languageId, new DefinitionAdapter(worker)));
    }
    if (modeConfiguration.references) {
      providers.push(languages.registerReferenceProvider(languageId, new ReferenceAdapter(worker)));
    }
    if (modeConfiguration.documentSymbols) {
      providers.push(languages.registerDocumentSymbolProvider(languageId, new DocumentSymbolAdapter(worker)));
    }
    if (modeConfiguration.rename) {
      providers.push(languages.registerRenameProvider(languageId, new RenameAdapter(worker)));
    }
    if (modeConfiguration.colors) {
      providers.push(languages.registerColorProvider(languageId, new DocumentColorAdapter(worker)));
    }
    if (modeConfiguration.foldingRanges) {
      providers.push(languages.registerFoldingRangeProvider(languageId, new FoldingRangeAdapter(worker)));
    }
    if (modeConfiguration.diagnostics) {
      providers.push(new DiagnosticsAdapter(languageId, worker, defaults));
    }
    if (modeConfiguration.selectionRanges) {
      providers.push(languages.registerSelectionRangeProvider(languageId, new SelectionRangeAdapter(worker)));
    }
  }
  registerProviders();
  disposables.push(asDisposable(providers));
  return asDisposable(disposables);
}
function asDisposable(disposables) {
  return { dispose: function() {
    return disposeAll(disposables);
  } };
}
function disposeAll(disposables) {
  while (disposables.length) {
    disposables.pop().dispose();
  }
}
export { setupMode };
