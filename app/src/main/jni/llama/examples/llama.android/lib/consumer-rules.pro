-keep class com.arm.aichat.* { *; }
-keep class com.arm.aichat.gguf.* { *; }

-keepclasseswithmembernames class * {
    native <methods>;
}

#noinspection ShrinkerUnresolvedReference
-keep class kotlin.Metadata { *; }
