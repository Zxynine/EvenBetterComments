


namespace Colour {
	// const envRegex = new RegExp( "\\$\\{(.*?)\\}", "g" );
	const rgbRegex = new RegExp( "^rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*(\\d+(?:\\.\\d+)?))?\\)$", "gi" );

	



	export function isHexColour( colour:string ) {
		var withoutHash = (colour.indexOf('#') === 0)? colour.substring(1) : colour;
		var hex = withoutHash.split(/ /)[0].replace( /[^\da-fA-F]/g, '' );
		return ( typeof colour === "string" ) 
			&& hex.length === withoutHash.length 
			&& ( hex.length === 3 || hex.length === 4 || hex.length === 6 || hex.length === 8 ) 
			&& !isNaN( parseInt( hex, 16 ) );
	}





	export function isRgbColour(colour:string){
		return colour.match(rgbRegex) !== null;
	}






	// export function hexToRgba( hex:string, opacity:int ) {
	// 	function toComponent( digits:string ) {
	// 		return ( digits.length == 1 ) ? parseInt( digits + digits, 16 ) : parseInt( digits, 16 );
	// 	}
	
	// 	if( hex !== undefined ) {
	// 		hex = hex.replace( '#', '' );
	
	// 		var rgb = hex.substring( 0, ( hex.length == 3 || hex.length == 4 ) ? 3 : 6 );
	
	// 		var r = toComponent( rgb.substring( 0, rgb.length / 3 ) );
	// 		var g = toComponent( rgb.substring( rgb.length / 3, 2 * rgb.length / 3 ) );
	// 		var b = toComponent( rgb.substring( 2 * rgb.length / 3, 3 * rgb.length / 3 ) );
	
	// 		if( hex.length == 4 || hex.length == 8 ) {
	// 			opacity = parseInt( toComponent( hex.substring( 3 * hex.length / 4, 4 * hex.length / 4 ) ) * 100 / 255 );
	// 		}
	
	// 		return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
	// 	}
	
	// 	return '#0F0';
	// }


	// function validateColours( workspace )
	// {
	// 	function check( setting )
	// 	{
	// 		var definedColour = workspace.getConfiguration( 'todo-tree.highlights' ).get( setting );
	// 		if( definedColour !== undefined && !utils.isValidColour( definedColour ) )
	// 		{
	// 			invalidColours.push( setting + ' (' + definedColour + ')' );
	// 		}
	// 	}
	
	// 	var invalidColours = [];
	// 	var result = "";
	
	// 	var attributeList = [ 'foreground', 'background', 'iconColour', 'rulerColour' ];
	// 	attributeList.forEach( function( attribute ) { check( 'defaultHighlight.' + attribute ); } );
	
	// 	var config = vscode.workspace.getConfiguration( 'todo-tree.highlights' );
	// 	Object.keys( config.customHighlight ).forEach( function( tag )
	// 	{
	// 		attributeList.forEach( function( attribute ) { check( 'customHighlight.' + tag + '.' + attribute ); } );
	// 	} );
	
	// 	if( invalidColours.length > 0 )
	// 	{
	// 		result = "Invalid colour settings: " + invalidColours.join( ', ' );
	// 	}
	
	// 	return result;
	// }
	
	// function validateIconColours( workspace )
	// {
	// 	var hasInvalidCodiconColour = false;
	// 	var hasInvalidOcticonColour = false;
	
	// 	function checkIconColour( setting )
	// 	{
	// 		var icon = workspace.getConfiguration( 'todo-tree.highlights' ).get( setting + ".icon" );
	// 		var iconColour = workspace.getConfiguration( 'todo-tree.highlights' ).get( setting + ".iconColour" );
	// 		if( icon !== undefined && iconColour !== undefined )
	// 		{
	// 			if( utils.isCodicon( icon ) )
	// 			{
	// 				if( utils.isHexColour( iconColour ) || utils.isRgbColour( iconColour ) || utils.isNamedColour( iconColour ) )
	// 				{
	// 					invalidIconColours.push( setting + '.iconColour (' + iconColour + ')' );
	// 					hasInvalidCodiconColour = true;
	// 				}
	// 			}
	// 			else
	// 			{
	// 				if( utils.isThemeColour( iconColour ) )
	// 				{
	// 					invalidIconColours.push( setting + '.iconColour (' + iconColour + ')' );
	// 					hasInvalidOcticonColour = true;
	// 				}
	// 			}
	// 		}
	// 	}
	
	// 	var invalidIconColours = [];
	// 	var result = "";
	
	// 	checkIconColour( 'defaultHighlight' );
	
	// 	var config = vscode.workspace.getConfiguration( 'todo-tree.highlights' );
	// 	Object.keys( config.customHighlight ).forEach( function( tag )
	// 	{
	// 		checkIconColour( 'customHighlight.' + tag );
	// 	} );
	
	// 	if( invalidIconColours.length > 0 )
	// 	{
	// 		result = "Invalid icon colour settings: " + invalidIconColours.join( ', ' ) + ".";
	// 		if( hasInvalidCodiconColour )
	// 		{
	// 			result += " Codicons can only use theme colours.";
	// 		}
	// 		if( hasInvalidOcticonColour )
	// 		{
	// 			result += " Theme colours can only be used with Codicons.";
	// 		}
	// 	}
	
	// 	return result;
	// }






}


































declare const enum ColourName {
	Aliceblue = 'aliceblue',
	Antiquewhite = 'antiquewhite',
	Aqua = 'aqua',
	Aquamarine = 'aquamarine',
	Azure = 'azure',
	Beige = 'beige',
	Bisque = 'bisque',
	Black = 'black',
    Blanchedalmond = 'blanchedalmond',
	Blue = 'blue',
	Blueviolet = 'blueviolet',
	Brown = 'brown',
	Burlywood = 'burlywood',
	Cadetblue = 'cadetblue',
	Chartreuse = 'chartreuse',
	Chocolate = 'chocolate',
    Coral = 'coral',
	Cornflowerblue = 'cornflowerblue',
	Cornsilk = 'cornsilk',
	Crimson = 'crimson',
	Cyan = 'cyan',
	Darkblue = 'darkblue',
	Darkcyan = 'darkcyan',
	Darkgoldenrod = 'darkgoldenrod',
    Darkgray = 'darkgray',
	Darkgreen = 'darkgreen',
	Darkgrey = 'darkgrey',
	Darkkhaki = 'darkkhaki',
	Darkmagenta = 'darkmagenta',
	Darkolivegreen = 'darkolivegreen',
	Darkorange = 'darkorange',
	Darkorchid = 'darkorchid',
    Darkred = 'darkred',
	Darksalmon = 'darksalmon',
	Darkseagreen = 'darkseagreen',
	Darkslateblue = 'darkslateblue',
	Darkslategray = 'darkslategray',
	Darkslategrey = 'darkslategrey',
	Darkturquoise = 'darkturquoise',
	Darkviolet = 'darkviolet',
    Deeppink = 'deeppink',
	Deepskyblue = 'deepskyblue',
	Dimgray = 'dimgray',
	Dimgrey = 'dimgrey',
	Dodgerblue = 'dodgerblue',
	Firebrick = 'firebrick',
	Floralwhite = 'floralwhite',
	Forestgreen = 'forestgreen',
    Fuchsia = 'fuchsia',
	Gainsboro = 'gainsboro',
	Ghostwhite = 'ghostwhite',
	Gold = 'gold',
	Goldenrod = 'goldenrod',
	Gray = 'gray',
	Grey = 'grey',
	Green = 'green',
    Greenyellow = 'greenyellow',
	Honeydew = 'honeydew',
	Hotpink = 'hotpink',
	Indianred = 'indianred',
	Indigo = 'indigo',
	Ivory = 'ivory',
	Khaki = 'khaki',
	Lavender = 'lavender',
    Lavenderblush = 'lavenderblush',
	Lawngreen = 'lawngreen',
	Lemonchiffon = 'lemonchiffon',
	Lightblue = 'lightblue',
	Lightcoral = 'lightcoral',
	Lightcyan = 'lightcyan',
	Lightgoldenrodyellow = 'lightgoldenrodyellow',
	Lightgray = 'lightgray',
    Lightgreen = 'lightgreen',
	Lightgrey = 'lightgrey',
	Lightpink = 'lightpink',
	Lightsalmon = 'lightsalmon',
	Lightseagreen = 'lightseagreen',
	Lightskyblue = 'lightskyblue',
	Lightslategray = 'lightslategray',
	Lightslategrey = 'lightslategrey',
    Lightsteelblue = 'lightsteelblue',
	Lightyellow = 'lightyellow',
	Lime = 'lime',
	Limegreen = 'limegreen',
	Linen = 'linen',
	Magenta = 'magenta',
	Maroon = 'maroon',
	Mediumaquamarine = 'mediumaquamarine',
    Mediumblue = 'mediumblue',
	Mediumorchid = 'mediumorchid',
	Mediumpurple = 'mediumpurple',
	Mediumseagreen = 'mediumseagreen',
	Mediumslateblue = 'mediumslateblue',
	Mediumspringgreen = 'mediumspringgreen',
	Mediumturquoise = 'mediumturquoise',
	Mediumvioletred = 'mediumvioletred',
    Midnightblue = 'midnightblue',
	Mintcream = 'mintcream',
	Mistyrose = 'mistyrose',
	Moccasin = 'moccasin',
	Navajowhite = 'navajowhite',
	Navy = 'navy',
	Oldlace = 'oldlace',
	Olive = 'olive',
    Olivedrab = 'olivedrab',
	Orange = 'orange',
	Orangered = 'orangered',
	Orchid = 'orchid',
	Palegoldenrod = 'palegoldenrod',
	Palegreen = 'palegreen',
	Paleturquoise = 'paleturquoise',
	Palevioletred = 'palevioletred',
    Papayawhip = 'papayawhip',
	Peachpuff = 'peachpuff',
	Peru = 'peru',
	Pink = 'pink',
	Plum = 'plum',
	Powderblue = 'powderblue',
	Purple = 'purple',
	Red = 'red',
    Rosybrown = 'rosybrown',
	Royalblue = 'royalblue',
	Saddlebrown = 'saddlebrown',
	Salmon = 'salmon',
	Sandybrown = 'sandybrown',
	Seagreen = 'seagreen',
	Seashell = 'seashell',
	Sienna = 'sienna',
    Silver = 'silver',
	Skyblue = 'skyblue',
	Slateblue = 'slateblue',
	Slategray = 'slategray',
	Slategrey = 'slategrey',
	Snow = 'snow',
	Springgreen = 'springgreen',
	Steelblue = 'steelblue',
    Tan = 'tan',
	Teal = 'teal',
	Thistle = 'thistle',
	Tomato = 'tomato',
	Turquoise = 'turquoise',
	Violet = 'violet',
	Wheat = 'wheat',
	White = 'white',
    Whitesmoke = 'whitesmoke',
	Yellow = 'yellow',
	Yellowgreen = 'yellowgreen',

	Transparent = 'transparent'
}







declare const enum ThemeColourName {
	ActivityBarActiveBorder = "activityBar.activeBorder",
    ActivityBarBackground = "activityBar.background",
    ActivityBarBorder = "activityBar.border",
    ActivityBarDropBorder = "activityBar.dropBorder",
    ActivityBarForeground = "activityBar.foreground",
    ActivityBarInactiveForeground = "activityBar.inactiveForeground",
    ActivityBarBadgeBackground = "activityBarBadge.background",
    ActivityBarBadgeForeground = "activityBarBadge.foreground",
    BadgeBackground = "badge.background",
    BadgeForeground = "badge.foreground",
    BreadcrumbActiveSelectionForeground = "breadcrumb.activeSelectionForeground",
    BreadcrumbBackground = "breadcrumb.background",
    BreadcrumbFocusForeground = "breadcrumb.focusForeground",
    BreadcrumbForeground = "breadcrumb.foreground",
    BreadcrumbPickerBackground = "breadcrumbPicker.background",
    ButtonBackground = "button.background",
    ButtonForeground = "button.foreground",
    ButtonHoverBackground = "button.hoverBackground",
    ButtonSecondaryBackground = "button.secondaryBackground",
    ButtonSecondaryForeground = "button.secondaryForeground",
    ButtonSecondaryHoverBackground = "button.secondaryHoverBackground",
    CheckboxBackground = "checkbox.background",
    CheckboxBorder = "checkbox.border",
    CheckboxForeground = "checkbox.foreground",
    DebugConsoleErrorForeground = "debugConsole.errorForeground",
    DebugConsoleInfoForeground = "debugConsole.infoForeground",
    DebugConsoleSourceForeground = "debugConsole.sourceForeground",
    DebugConsoleWarningForeground = "debugConsole.warningForeground",
    DebugConsoleInputIconForeground = "debugConsoleInputIcon.foreground",
    DebugExceptionWidgetBackground = "debugExceptionWidget.background",
    DebugExceptionWidgetBorder = "debugExceptionWidget.border",
    DebugIconBreakpointCurrentStackframeForeground = "debugIcon.breakpointCurrentStackframeForeground",
    DebugIconBreakpointDisabledForeground = "debugIcon.breakpointDisabledForeground",
    DebugIconBreakpointForeground = "debugIcon.breakpointForeground",
    DebugIconBreakpointStackframeForeground = "debugIcon.breakpointStackframeForeground",
    DebugIconBreakpointUnverifiedForeground = "debugIcon.breakpointUnverifiedForeground",
    DebugIconContinueForeground = "debugIcon.continueForeground",
    DebugIconDisconnectForeground = "debugIcon.disconnectForeground",
    DebugIconPauseForeground = "debugIcon.pauseForeground",
    DebugIconRestartForeground = "debugIcon.restartForeground",
    DebugIconStartForeground = "debugIcon.startForeground",
    DebugIconStepBackForeground = "debugIcon.stepBackForeground",
    DebugIconStepIntoForeground = "debugIcon.stepIntoForeground",
    DebugIconStepOutForeground = "debugIcon.stepOutForeground",
    DebugIconStepOverForeground = "debugIcon.stepOverForeground",
    DebugIconStopForeground = "debugIcon.stopForeground",
    DebugTokenExpressionBoolean = "debugTokenExpression.boolean",
    DebugTokenExpressionError = "debugTokenExpression.error",
    DebugTokenExpressionName = "debugTokenExpression.name",
    DebugTokenExpressionNumber = "debugTokenExpression.number",
    DebugTokenExpressionString = "debugTokenExpression.string",
    DebugTokenExpressionValue = "debugTokenExpression.value",
    DebugToolBarBackground = "debugToolBar.background",
    DebugViewExceptionLabelBackground = "debugView.exceptionLabelBackground",
    DebugViewExceptionLabelForeground = "debugView.exceptionLabelForeground",
    DebugViewStateLabelBackground = "debugView.stateLabelBackground",
    DebugViewStateLabelForeground = "debugView.stateLabelForeground",
    DebugViewValueChangedHighlight = "debugView.valueChangedHighlight",
    DescriptionForeground = "descriptionForeground",
    DiffEditorDiagonalFill = "diffEditor.diagonalFill",
    DiffEditorInsertedTextBackground = "diffEditor.insertedTextBackground",
    DiffEditorRemovedTextBackground = "diffEditor.removedTextBackground",
    DropdownBackground = "dropdown.background",
    DropdownBorder = "dropdown.border",
    DropdownForeground = "dropdown.foreground",
    EditorBackground = "editor.background",
    EditorFindMatchBackground = "editor.findMatchBackground",
    EditorFindMatchHighlightBackground = "editor.findMatchHighlightBackground",
    EditorFindRangeHighlightBackground = "editor.findRangeHighlightBackground",
    EditorFocusedStackFrameHighlightBackground = "editor.focusedStackFrameHighlightBackground",
    EditorFoldBackground = "editor.foldBackground",
    EditorForeground = "editor.foreground",
    EditorHoverHighlightBackground = "editor.hoverHighlightBackground",
    EditorInactiveSelectionBackground = "editor.inactiveSelectionBackground",
    EditorLineHighlightBorder = "editor.lineHighlightBorder",
    EditorOnTypeRenameBackground = "editor.onTypeRenameBackground",
    EditorRangeHighlightBackground = "editor.rangeHighlightBackground",
    EditorSelectionBackground = "editor.selectionBackground",
    EditorSelectionHighlightBackground = "editor.selectionHighlightBackground",
    EditorSnippetFinalTabstopHighlightBorder = "editor.snippetFinalTabstopHighlightBorder",
    EditorSnippetTabstopHighlightBackground = "editor.snippetTabstopHighlightBackground",
    EditorStackFrameHighlightBackground = "editor.stackFrameHighlightBackground",
    EditorSymbolHighlightBackground = "editor.symbolHighlightBackground",
    EditorWordHighlightBackground = "editor.wordHighlightBackground",
    EditorWordHighlightStrongBackground = "editor.wordHighlightStrongBackground",
    EditorActiveLineNumberForeground = "editorActiveLineNumber.foreground",
    EditorBracketMatchBackground = "editorBracketMatch.background",
    EditorBracketMatchBorder = "editorBracketMatch.border",
    EditorCodeLensForeground = "editorCodeLens.foreground",
    EditorCursorForeground = "editorCursor.foreground",
    EditorErrorForeground = "editorError.foreground",
    EditorGroupBorder = "editorGroup.border",
    EditorGroupDropBackground = "editorGroup.dropBackground",
    EditorGroupHeaderNoTabsBackground = "editorGroupHeader.noTabsBackground",
    EditorGroupHeaderTabsBackground = "editorGroupHeader.tabsBackground",
    EditorGutterAddedBackground = "editorGutter.addedBackground",
    EditorGutterBackground = "editorGutter.background",
    EditorGutterCommentRangeForeground = "editorGutter.commentRangeForeground",
    EditorGutterDeletedBackground = "editorGutter.deletedBackground",
    EditorGutterFoldingControlForeground = "editorGutter.foldingControlForeground",
    EditorGutterModifiedBackground = "editorGutter.modifiedBackground",
    EditorHintForeground = "editorHint.foreground",
    EditorHoverWidgetBackground = "editorHoverWidget.background",
    EditorHoverWidgetBorder = "editorHoverWidget.border",
    EditorHoverWidgetForeground = "editorHoverWidget.foreground",
    EditorHoverWidgetStatusBarBackground = "editorHoverWidget.statusBarBackground",
    EditorIndentGuideActiveBackground = "editorIndentGuide.activeBackground",
    EditorIndentGuideBackground = "editorIndentGuide.background",
    EditorInfoForeground = "editorInfo.foreground",
    EditorLightBulbForeground = "editorLightBulb.foreground",
    EditorLightBulbAutoFixForeground = "editorLightBulbAutoFix.foreground",
    EditorLineNumberActiveForeground = "editorLineNumber.activeForeground",
    EditorLineNumberForeground = "editorLineNumber.foreground",
    EditorLinkActiveForeground = "editorLink.activeForeground",
    EditorMarkerNavigationBackground = "editorMarkerNavigation.background",
    EditorMarkerNavigationErrorBackground = "editorMarkerNavigationError.background",
    EditorMarkerNavigationInfoBackground = "editorMarkerNavigationInfo.background",
    EditorMarkerNavigationWarningBackground = "editorMarkerNavigationWarning.background",
    EditorOverviewRulerAddedForeground = "editorOverviewRuler.addedForeground",
    EditorOverviewRulerBorder = "editorOverviewRuler.border",
    EditorOverviewRulerBracketMatchForeground = "editorOverviewRuler.bracketMatchForeground",
    EditorOverviewRulerCommonContentForeground = "editorOverviewRuler.commonContentForeground",
    EditorOverviewRulerCurrentContentForeground = "editorOverviewRuler.currentContentForeground",
    EditorOverviewRulerDeletedForeground = "editorOverviewRuler.deletedForeground",
    EditorOverviewRulerErrorForeground = "editorOverviewRuler.errorForeground",
    EditorOverviewRulerFindMatchForeground = "editorOverviewRuler.findMatchForeground",
    EditorOverviewRulerIncomingContentForeground = "editorOverviewRuler.incomingContentForeground",
    EditorOverviewRulerInfoForeground = "editorOverviewRuler.infoForeground",
    EditorOverviewRulerModifiedForeground = "editorOverviewRuler.modifiedForeground",
    EditorOverviewRulerRangeHighlightForeground = "editorOverviewRuler.rangeHighlightForeground",
    EditorOverviewRulerSelectionHighlightForeground = "editorOverviewRuler.selectionHighlightForeground",
    EditorOverviewRulerWarningForeground = "editorOverviewRuler.warningForeground",
    EditorOverviewRulerWordHighlightForeground = "editorOverviewRuler.wordHighlightForeground",
    EditorOverviewRulerWordHighlightStrongForeground = "editorOverviewRuler.wordHighlightStrongForeground",
    EditorPaneBackground = "editorPane.background",
    EditorRulerForeground = "editorRuler.foreground",
    EditorSuggestWidgetBackground = "editorSuggestWidget.background",
    EditorSuggestWidgetBorder = "editorSuggestWidget.border",
    EditorSuggestWidgetForeground = "editorSuggestWidget.foreground",
    EditorSuggestWidgetHighlightForeground = "editorSuggestWidget.highlightForeground",
    EditorSuggestWidgetSelectedBackground = "editorSuggestWidget.selectedBackground",
    EditorUnnecessaryCodeOpacity = "editorUnnecessaryCode.opacity",
    EditorWarningForeground = "editorWarning.foreground",
    EditorWhitespaceForeground = "editorWhitespace.foreground",
    EditorWidgetBackground = "editorWidget.background",
    EditorWidgetBorder = "editorWidget.border",
    EditorWidgetForeground = "editorWidget.foreground",
    ErrorForeground = "errorForeground",
    ExtensionBadgeRemoteBackground = "extensionBadge.remoteBackground",
    ExtensionBadgeRemoteForeground = "extensionBadge.remoteForeground",
    ExtensionButtonProminentBackground = "extensionButton.prominentBackground",
    ExtensionButtonProminentForeground = "extensionButton.prominentForeground",
    ExtensionButtonProminentHoverBackground = "extensionButton.prominentHoverBackground",
    FocusBorder = "focusBorder",
    Foreground = "foreground",
    GitDecorationAddedResourceForeground = "gitDecoration.addedResourceForeground",
    GitDecorationConflictingResourceForeground = "gitDecoration.conflictingResourceForeground",
    GitDecorationDeletedResourceForeground = "gitDecoration.deletedResourceForeground",
    GitDecorationIgnoredResourceForeground = "gitDecoration.ignoredResourceForeground",
    GitDecorationModifiedResourceForeground = "gitDecoration.modifiedResourceForeground",
    GitDecorationSubmoduleResourceForeground = "gitDecoration.submoduleResourceForeground",
    GitDecorationUntrackedResourceForeground = "gitDecoration.untrackedResourceForeground",
    IconForeground = "icon.foreground",
    ImagePreviewBorder = "imagePreview.border",
    InputBackground = "input.background",
    InputForeground = "input.foreground",
    InputPlaceholderForeground = "input.placeholderForeground",
    InputOptionActiveBackground = "inputOption.activeBackground",
    InputOptionActiveBorder = "inputOption.activeBorder",
    InputOptionActiveForeground = "inputOption.activeForeground",
    InputValidationErrorBackground = "inputValidation.errorBackground",
    InputValidationErrorBorder = "inputValidation.errorBorder",
    InputValidationInfoBackground = "inputValidation.infoBackground",
    InputValidationInfoBorder = "inputValidation.infoBorder",
    InputValidationWarningBackground = "inputValidation.warningBackground",
    InputValidationWarningBorder = "inputValidation.warningBorder",
    ListActiveSelectionBackground = "list.activeSelectionBackground",
    ListActiveSelectionForeground = "list.activeSelectionForeground",
    ListDeemphasizedForeground = "list.deemphasizedForeground",
    ListDropBackground = "list.dropBackground",
    ListErrorForeground = "list.errorForeground",
    ListFilterMatchBackground = "list.filterMatchBackground",
    ListFocusBackground = "list.focusBackground",
    ListHighlightForeground = "list.highlightForeground",
    ListHoverBackground = "list.hoverBackground",
    ListInactiveSelectionBackground = "list.inactiveSelectionBackground",
    ListInvalidItemForeground = "list.invalidItemForeground",
    ListWarningForeground = "list.warningForeground",
    ListFilterWidgetBackground = "listFilterWidget.background",
    ListFilterWidgetNoMatchesOutline = "listFilterWidget.noMatchesOutline",
    ListFilterWidgetOutline = "listFilterWidget.outline",
    MenuBackground = "menu.background",
    MenuForeground = "menu.foreground",
    MenuSelectionBackground = "menu.selectionBackground",
    MenuSelectionForeground = "menu.selectionForeground",
    MenuSeparatorBackground = "menu.separatorBackground",
    MenubarSelectionBackground = "menubar.selectionBackground",
    MenubarSelectionForeground = "menubar.selectionForeground",
    MergeCommonContentBackground = "merge.commonContentBackground",
    MergeCommonHeaderBackground = "merge.commonHeaderBackground",
    MergeCurrentContentBackground = "merge.currentContentBackground",
    MergeCurrentHeaderBackground = "merge.currentHeaderBackground",
    MergeIncomingContentBackground = "merge.incomingContentBackground",
    MergeIncomingHeaderBackground = "merge.incomingHeaderBackground",
    MinimapErrorHighlight = "minimap.errorHighlight",
    MinimapFindMatchHighlight = "minimap.findMatchHighlight",
    MinimapSelectionHighlight = "minimap.selectionHighlight",
    MinimapWarningHighlight = "minimap.warningHighlight",
    MinimapGutterAddedBackground = "minimapGutter.addedBackground",
    MinimapGutterDeletedBackground = "minimapGutter.deletedBackground",
    MinimapGutterModifiedBackground = "minimapGutter.modifiedBackground",
    MinimapSliderActiveBackground = "minimapSlider.activeBackground",
    MinimapSliderBackground = "minimapSlider.background",
    MinimapSliderHoverBackground = "minimapSlider.hoverBackground",
    NotebookCellBorderColor = "notebook.cellBorderColor",
    NotebookCellHoverBackground = "notebook.cellHoverBackground",
    NotebookCellInsertionIndicator = "notebook.cellInsertionIndicator",
    NotebookCellStatusBarItemHoverBackground = "notebook.cellStatusBarItemHoverBackground",
    NotebookCellToolbarSeparator = "notebook.cellToolbarSeparator",
    NotebookFocusedCellBackground = "notebook.focusedCellBackground",
    NotebookFocusedCellBorder = "notebook.focusedCellBorder",
    NotebookFocusedEditorBorder = "notebook.focusedEditorBorder",
    NotebookOutputContainerBackgroundColor = "notebook.outputContainerBackgroundColor",
    NotebookSymbolHighlightBackground = "notebook.symbolHighlightBackground",
    NotebookScrollbarSliderActiveBackground = "notebookScrollbarSlider.activeBackground",
    NotebookScrollbarSliderBackground = "notebookScrollbarSlider.background",
    NotebookScrollbarSliderHoverBackground = "notebookScrollbarSlider.hoverBackground",
    NotebookStatusErrorIconForeground = "notebookStatusErrorIcon.foreground",
    NotebookStatusRunningIconForeground = "notebookStatusRunningIcon.foreground",
    NotebookStatusSuccessIconForeground = "notebookStatusSuccessIcon.foreground",
    NotificationCenterHeaderBackground = "notificationCenterHeader.background",
    NotificationLinkForeground = "notificationLink.foreground",
    NotificationsBackground = "notifications.background",
    NotificationsBorder = "notifications.border",
    NotificationsForeground = "notifications.foreground",
    NotificationsErrorIconForeground = "notificationsErrorIcon.foreground",
    NotificationsInfoIconForeground = "notificationsInfoIcon.foreground",
    NotificationsWarningIconForeground = "notificationsWarningIcon.foreground",
    PanelBackground = "panel.background",
    PanelBorder = "panel.border",
    PanelDropBorder = "panel.dropBorder",
    PanelSectionBorder = "panelSection.border",
    PanelSectionDropBackground = "panelSection.dropBackground",
    PanelSectionHeaderBackground = "panelSectionHeader.background",
    PanelTitleActiveBorder = "panelTitle.activeBorder",
    PanelTitleActiveForeground = "panelTitle.activeForeground",
    PanelTitleInactiveForeground = "panelTitle.inactiveForeground",
    PeekViewBorder = "peekView.border",
    PeekViewEditorBackground = "peekViewEditor.background",
    PeekViewEditorMatchHighlightBackground = "peekViewEditor.matchHighlightBackground",
    PeekViewEditorGutterBackground = "peekViewEditorGutter.background",
    PeekViewResultBackground = "peekViewResult.background",
    PeekViewResultFileForeground = "peekViewResult.fileForeground",
    PeekViewResultLineForeground = "peekViewResult.lineForeground",
    PeekViewResultMatchHighlightBackground = "peekViewResult.matchHighlightBackground",
    PeekViewResultSelectionBackground = "peekViewResult.selectionBackground",
    PeekViewResultSelectionForeground = "peekViewResult.selectionForeground",
    PeekViewTitleBackground = "peekViewTitle.background",
    PeekViewTitleDescriptionForeground = "peekViewTitleDescription.foreground",
    PeekViewTitleLabelForeground = "peekViewTitleLabel.foreground",
    PickerGroupBorder = "pickerGroup.border",
    PickerGroupForeground = "pickerGroup.foreground",
    ProblemsErrorIconForeground = "problemsErrorIcon.foreground",
    ProblemsInfoIconForeground = "problemsInfoIcon.foreground",
    ProblemsWarningIconForeground = "problemsWarningIcon.foreground",
    ProgressBarBackground = "progressBar.background",
    QuickInputBackground = "quickInput.background",
    QuickInputForeground = "quickInput.foreground",
    QuickInputTitleBackground = "quickInputTitle.background",
    ScmProviderBorder = "scm.providerBorder",
    ScrollbarShadow = "scrollbar.shadow",
    ScrollbarSliderActiveBackground = "scrollbarSlider.activeBackground",
    ScrollbarSliderBackground = "scrollbarSlider.background",
    ScrollbarSliderHoverBackground = "scrollbarSlider.hoverBackground",
    SearchEditorFindMatchBackground = "searchEditor.findMatchBackground",
    SettingsCheckboxBackground = "settings.checkboxBackground",
    SettingsCheckboxBorder = "settings.checkboxBorder",
    SettingsCheckboxForeground = "settings.checkboxForeground",
    SettingsDropdownBackground = "settings.dropdownBackground",
    SettingsDropdownBorder = "settings.dropdownBorder",
    SettingsDropdownForeground = "settings.dropdownForeground",
    SettingsDropdownListBorder = "settings.dropdownListBorder",
    SettingsHeaderForeground = "settings.headerForeground",
    SettingsModifiedItemIndicator = "settings.modifiedItemIndicator",
    SettingsNumberInputBackground = "settings.numberInputBackground",
    SettingsNumberInputForeground = "settings.numberInputForeground",
    SettingsTextInputBackground = "settings.textInputBackground",
    SettingsTextInputForeground = "settings.textInputForeground",
    SideBarBackground = "sideBar.background",
    SideBarBorder = "sideBar.border",
    SideBarDropBackground = "sideBar.dropBackground",
    SideBarSectionHeaderBackground = "sideBarSectionHeader.background",
    SideBarSectionHeaderBorder = "sideBarSectionHeader.border",
    SideBarTitleForeground = "sideBarTitle.foreground",
    StatusBarBackground = "statusBar.background",
    StatusBarBorder = "statusBar.border",
    StatusBarDebuggingBackground = "statusBar.debuggingBackground",
    StatusBarDebuggingBorder = "statusBar.debuggingBorder",
    StatusBarDebuggingForeground = "statusBar.debuggingForeground",
    StatusBarForeground = "statusBar.foreground",
    StatusBarNoFolderBackground = "statusBar.noFolderBackground",
    StatusBarNoFolderBorder = "statusBar.noFolderBorder",
    StatusBarNoFolderForeground = "statusBar.noFolderForeground",
    StatusBarItemActiveBackground = "statusBarItem.activeBackground",
    StatusBarItemHoverBackground = "statusBarItem.hoverBackground",
    StatusBarItemProminentBackground = "statusBarItem.prominentBackground",
    StatusBarItemProminentForeground = "statusBarItem.prominentForeground",
    StatusBarItemProminentHoverBackground = "statusBarItem.prominentHoverBackground",
    StatusBarItemRemoteBackground = "statusBarItem.remoteBackground",
    StatusBarItemRemoteForeground = "statusBarItem.remoteForeground",
    SymbolIconArrayForeground = "symbolIcon.arrayForeground",
    SymbolIconBooleanForeground = "symbolIcon.booleanForeground",
    SymbolIconClassForeground = "symbolIcon.classForeground",
    SymbolIconColorForeground = "symbolIcon.colorForeground",
    SymbolIconConstantForeground = "symbolIcon.constantForeground",
    SymbolIconConstructorForeground = "symbolIcon.constructorForeground",
    SymbolIconEnumeratorForeground = "symbolIcon.enumeratorForeground",
    SymbolIconEnumeratorMemberForeground = "symbolIcon.enumeratorMemberForeground",
    SymbolIconEventForeground = "symbolIcon.eventForeground",
    SymbolIconFieldForeground = "symbolIcon.fieldForeground",
    SymbolIconFileForeground = "symbolIcon.fileForeground",
    SymbolIconFolderForeground = "symbolIcon.folderForeground",
    SymbolIconFunctionForeground = "symbolIcon.functionForeground",
    SymbolIconInterfaceForeground = "symbolIcon.interfaceForeground",
    SymbolIconKeyForeground = "symbolIcon.keyForeground",
    SymbolIconKeywordForeground = "symbolIcon.keywordForeground",
    SymbolIconMethodForeground = "symbolIcon.methodForeground",
    SymbolIconModuleForeground = "symbolIcon.moduleForeground",
    SymbolIconNamespaceForeground = "symbolIcon.namespaceForeground",
    SymbolIconNullForeground = "symbolIcon.nullForeground",
    SymbolIconNumberForeground = "symbolIcon.numberForeground",
    SymbolIconObjectForeground = "symbolIcon.objectForeground",
    SymbolIconOperatorForeground = "symbolIcon.operatorForeground",
    SymbolIconPackageForeground = "symbolIcon.packageForeground",
    SymbolIconPropertyForeground = "symbolIcon.propertyForeground",
    SymbolIconReferenceForeground = "symbolIcon.referenceForeground",
    SymbolIconSnippetForeground = "symbolIcon.snippetForeground",
    SymbolIconStringForeground = "symbolIcon.stringForeground",
    SymbolIconStructForeground = "symbolIcon.structForeground",
    SymbolIconTextForeground = "symbolIcon.textForeground",
    SymbolIconTypeParameterForeground = "symbolIcon.typeParameterForeground",
    SymbolIconUnitForeground = "symbolIcon.unitForeground",
    SymbolIconVariableForeground = "symbolIcon.variableForeground",
    TabActiveBackground = "tab.activeBackground",
    TabActiveForeground = "tab.activeForeground",
    TabActiveModifiedBorder = "tab.activeModifiedBorder",
    TabBorder = "tab.border",
    TabInactiveBackground = "tab.inactiveBackground",
    TabInactiveForeground = "tab.inactiveForeground",
    TabInactiveModifiedBorder = "tab.inactiveModifiedBorder",
    TabUnfocusedActiveBackground = "tab.unfocusedActiveBackground",
    TabUnfocusedActiveForeground = "tab.unfocusedActiveForeground",
    TabUnfocusedActiveModifiedBorder = "tab.unfocusedActiveModifiedBorder",
    TabUnfocusedInactiveBackground = "tab.unfocusedInactiveBackground",
    TabUnfocusedInactiveForeground = "tab.unfocusedInactiveForeground",
    TabUnfocusedInactiveModifiedBorder = "tab.unfocusedInactiveModifiedBorder",
    TerminalAnsiBlack = "terminal.ansiBlack",
    TerminalAnsiBlue = "terminal.ansiBlue",
    TerminalAnsiBrightBlack = "terminal.ansiBrightBlack",
    TerminalAnsiBrightBlue = "terminal.ansiBrightBlue",
    TerminalAnsiBrightCyan = "terminal.ansiBrightCyan",
    TerminalAnsiBrightGreen = "terminal.ansiBrightGreen",
    TerminalAnsiBrightMagenta = "terminal.ansiBrightMagenta",
    TerminalAnsiBrightRed = "terminal.ansiBrightRed",
    TerminalAnsiBrightWhite = "terminal.ansiBrightWhite",
    TerminalAnsiBrightYellow = "terminal.ansiBrightYellow",
    TerminalAnsiCyan = "terminal.ansiCyan",
    TerminalAnsiGreen = "terminal.ansiGreen",
    TerminalAnsiMagenta = "terminal.ansiMagenta",
    TerminalAnsiRed = "terminal.ansiRed",
    TerminalAnsiWhite = "terminal.ansiWhite",
    TerminalAnsiYellow = "terminal.ansiYellow",
    TerminalBorder = "terminal.border",
    TerminalForeground = "terminal.foreground",
    TerminalSelectionBackground = "terminal.selectionBackground",
    TextBlockQuoteBackground = "textBlockQuote.background",
    TextBlockQuoteBorder = "textBlockQuote.border",
    TextCodeBlockBackground = "textCodeBlock.background",
    TextLinkActiveForeground = "textLink.activeForeground",
    TextLinkForeground = "textLink.foreground",
    TextPreformatForeground = "textPreformat.foreground",
    TextSeparatorForeground = "textSeparator.foreground",
    TitleBarActiveBackground = "titleBar.activeBackground",
    TitleBarActiveForeground = "titleBar.activeForeground",
    TitleBarInactiveBackground = "titleBar.inactiveBackground",
    TitleBarInactiveForeground = "titleBar.inactiveForeground",
    TreeIndentGuidesStroke = "tree.indentGuidesStroke",
    WidgetShadow = "widget.shadow"

}